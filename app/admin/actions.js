"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function login(previousState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "メールアドレスとパスワードを入力してください。" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "ログインできませんでした。入力内容を確認してください。" };
  const { data: admin, error: roleError } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (roleError || !admin) {
    await supabase.auth.signOut();
    return { error: roleError ? "管理者権限を確認できませんでした。" : "このアカウントには管理者権限がありません。" };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("ログアウトできませんでした。再度お試しください。");
  redirect("/admin/login");
}

export async function saveQuestion(previousState, formData) {
  const supabase = await requireAdmin();
  const values = {
    question: String(formData.get("question") || "").trim(),
    answer: String(formData.get("answer") || "").trim(),
    category: String(formData.get("category") || ""),
    is_public: formData.get("is_public") === "on",
    parent_id: String(formData.get("parent_id") || "") || null,
  };
  const invalid = (error) => ({ error, values });
  if (!values.question || values.question.length > 500) return invalid("質問は1〜500文字で入力してください。");
  if (values.answer.length > 20000) return invalid("回答は20,000文字以内で入力してください。");
  if (!["career", "self", "technical"].includes(values.category)) return invalid("カテゴリを選択してください。");
  if (values.is_public && !values.answer) return invalid("公開する場合は回答を入力してください。");
  if (values.parent_id) {
    if (!/^[1-9]\d*$/.test(values.parent_id)) return invalid("親質問が正しくありません。");
    const { data: parent, error } = await supabase.from("questions").select("id").eq("id", values.parent_id).maybeSingle();
    if (error || !parent) return invalid("親質問を確認できませんでした。");
  }
  const id = String(formData.get("id") || "");
  if (id && !/^[1-9]\d*$/.test(id)) return invalid("質問IDが正しくありません。");
  // Parent relationships are chosen on creation and remain fixed when editing.
  const { parent_id, ...updates } = values;
  const query = id
    ? supabase.from("questions").update(updates).eq("id", id)
    : supabase.from("questions").insert({ ...updates, parent_id });
  const { data, error } = await query.select("id").single();
  if (error) return invalid("保存できませんでした。時間をおいて再度お試しください。");
  revalidatePath("/interview", "layout");
  revalidatePath("/admin");
  redirect(`/admin?saved=${data.id}`);
}
