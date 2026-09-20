import "server-only";

// Called only for persisted visitor comments, never for administrator posts.
export async function notifyComment(supabase, comment) {
  if (comment.notification_sent_at) return true;
  const { RESEND_API_KEY, NOTIFICATION_EMAIL, NOTIFICATION_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFICATION_EMAIL || !NOTIFICATION_FROM) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `visitor-comment-${comment.id}` },
      body: JSON.stringify({ from: NOTIFICATION_FROM, to: [NOTIFICATION_EMAIL], subject: "ポートフォリオに質問・コメントが届きました",
        text: `投稿先: ${comment.question_id ? "Interview" : "Projects"} #${comment.question_id || comment.project_id}\n名前: ${comment.author_name || "匿名"}\n\n${comment.body}\n\n管理者ダッシュボードで確認・回答してください。` }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const { error } = await supabase.from("comments").update({ notification_sent_at: new Date().toISOString() }).eq("id", comment.id);
    return !error;
  } catch { return false; }
}
