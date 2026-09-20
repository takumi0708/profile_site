"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { parseTags, validId } from "@/lib/validation.mjs";
import { parseProfileLinks } from "@/lib/profile-validation.mjs";

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
    category: String(formData.get("category") || "").trim(),
    tags: String(formData.get("tags") || ""),
    is_public: formData.get("is_public") === "on",
    parent_id: String(formData.get("parent_id") || "") || null,
  };
  const invalid = (error) => ({ error, values });
  if (!values.question || values.question.length > 500) return invalid("質問は1〜500文字で入力してください。");
  if (values.answer.length > 20000) return invalid("回答は20,000文字以内で入力してください。");
  if (!values.category || values.category.length > 50) return invalid("カテゴリは1〜50文字で入力してください。");
  let tags;
  try { tags = parseTags(values.tags); } catch (error) { return invalid(error.message); }
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
  updates.tags = tags;
  const query = id
    ? supabase.from("questions").update(updates).eq("id", id)
    : supabase.from("questions").insert({ ...updates, parent_id });
  const { data, error } = await query.select("id").single();
  if (error) return invalid("保存できませんでした。時間をおいて再度お試しください。");
  revalidatePath("/interview", "layout");
  revalidatePath("/admin");
  redirect(`/admin?saved=${data.id}`);
}

export async function deletePost(previousState, formData) {
  const supabase = await requireAdmin();
  const table = String(formData.get("table"));
  const id = String(formData.get("id"));
  if (!["questions", "projects", "comments"].includes(table) || !validId(id)) return { error: "削除対象が正しくありません。" };
  if (formData.get("confirm") !== "on") return { error: "削除確認にチェックしてください。" };
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id").maybeSingle();
  if (error || !data) return { error: "削除できませんでした。再読み込みしてお試しください。" };
  revalidatePath("/", "layout");
  return { success: "削除しました。" };
}

export async function saveProjectTags(previousState, formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  if (!validId(id)) return { error: "投稿IDが正しくありません。" };
  let tags;
  try { tags = parseTags(formData.get("tags")); } catch (error) { return { error: error.message }; }
  const { error } = await supabase.from("projects").update({ tags }).eq("id", id).select("id").single();
  if (error) return { error: "タグを保存できませんでした。追加SQLの実行を確認してください。" };
  revalidatePath("/", "layout");
  return { success: "タグを保存しました。" };
}

export async function saveProject(previousState, formData) {
  const supabase = await requireAdmin();
  const values = Object.fromEntries(["title", "summary", "technologies", "tags"].map(key => [key, String(formData.get(key) || "").trim()]));
  values.is_public = formData.get("is_public") === "on";
  const invalid = error => ({ error, values });
  if (!values.title || values.title.length > 200) return invalid("タイトルは1〜200文字で入力してください。");
  if (!values.summary || values.summary.length > 20000) return invalid("本文は1〜20,000文字で入力してください。");
  let tags, technologies;
  try { tags = parseTags(values.tags); technologies = parseTags(values.technologies); } catch (error) { return invalid(error.message); }
  const id = String(formData.get("id") || "");
  if (id && !validId(id)) return invalid("投稿IDが正しくありません。");
  const payload = { ...values, tags, technologies };
  const query = id ? supabase.from("projects").update(payload).eq("id", id) : supabase.from("projects").insert(payload);
  const { data, error } = await query.select("id").single();
  if (error) return invalid("プロジェクトを保存できませんでした。");
  revalidatePath("/projects", "layout");
  revalidatePath("/admin");
  redirect(`/admin?projectSaved=${data.id}#projects`);
}

export async function saveProfile(previousState, formData) {
  const supabase = await requireAdmin();
  const values = Object.fromEntries(["display_name", "bio", "links"].map(key => [key, String(formData.get(key) || "").trim()]));
  const invalid = error => ({ error, values });
  if (!values.display_name || values.display_name.length > 100 || values.bio.length > 5000) return invalid("名前は1〜100文字、自己紹介は5,000文字以内で入力してください。");
  let links;
  try { links = parseProfileLinks(values.links); } catch (error) { return invalid(error.message); }
  const { error } = await supabase.from("site_profile").update({ ...values, links }).eq("id", 1).select("id").single();
  if (error) return invalid("保存できませんでした。プロフィール用SQLの実行を確認してください。");
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: "トップページを更新しました。", values };
}
