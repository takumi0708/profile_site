"use server";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { validateComment, validId } from "@/lib/validation.mjs";
import { notifyComment } from "@/lib/notifications";
import { requireAdmin } from "@/lib/auth";

export async function submitComment(previousState, formData) {
  const values = { kind: String(formData.get("kind") || ""), target: String(formData.get("target") || ""), name: String(formData.get("name") || "").trim(), body: String(formData.get("body") || "").trim() };
  const error = validateComment(values);
  if (error) return { error, values };
  if (formData.get("website")) return { error: "送信できませんでした。", values };
  try {
    const supabase = createServiceClient();
    const h = await headers();
    // Vercel overwrites this header. Other hosts share a conservative global limit.
    const ip = process.env.VERCEL ? h.get("x-vercel-forwarded-for") || "unknown" : "local-or-untrusted-proxy";
    const fingerprint = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY).update(ip).digest("hex");
    const { data: id, error: insertError } = await supabase.rpc("submit_comment", { p_kind: values.kind, p_target: values.target, p_name: values.name, p_body: values.body, p_fingerprint: fingerprint });
    if (insertError) {
      const message = insertError.message;
      return { error: message.includes("DUPLICATE_COMMENT") ? "同じ内容のコメントはすでに受け付けています。"
        : message.includes("GLOBAL_RATE_LIMIT") ? "現在受付件数の上限に達しています。時間をおいてお試しください。"
        : message.includes("RATE_LIMIT") ? "送信回数の上限です。10分ほど待ってお試しください。"
        : "送信できませんでした。ページを再読み込みしてお試しください。", values };
    }
    const { data: comment } = await supabase.from("comments").select("*").eq("id", id).single();
    if (comment) await notifyComment(supabase, comment);
    revalidatePath("/admin");
    return { success: "送信しました。管理者が確認して回答します。" };
  } catch { return { error: "現在質問を受け付けられません。時間をおいてお試しください。", values }; }
}

export async function moderateComment(previousState, formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const answer = String(formData.get("answer") || "").trim();
  const is_public = formData.get("is_public") === "on";
  if (!validId(id) || answer.length > 20000 || (is_public && !answer)) return { error: "公開には回答が必要です。回答は20,000文字以内で入力してください。" };
  const { error } = await supabase.from("comments").update({ answer, is_public }).eq("id", id).select("id").single();
  if (error) return { error: "保存できませんでした。" };
  revalidatePath("/", "layout");
  return { success: "保存しました。" };
}

export async function retryNotification(previousState, formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  if (!validId(id)) return { error: "投稿が見つかりません。" };
  const { data, error } = await supabase.from("comments").select("*").eq("id", id).single();
  if (error) return { error: "投稿を取得できませんでした。" };
  const sent = await notifyComment(supabase, data);
  revalidatePath("/admin");
  return sent ? { success: "通知を送信しました。" } : { error: "通知を送信できませんでした。メール送信設定を確認してください。" };
}
