"use client";
import { useActionState } from "react";
import { submitComment, moderateComment, retryNotification } from "@/app/comments/actions";
import { buttonVariants } from "@/components/ui/button";
const field = "mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm";

export function CommentForm({ kind, target }) {
  const [state, action, pending] = useActionState(submitComment, {});
  if (state.success) return <p role="status" className="my-6 rounded-lg border p-4">{state.success}</p>;
  return <form action={action} className="mt-8 space-y-4 rounded-xl border p-6">
    <h2 className="text-xl font-semibold">この内容について質問・コメントする</h2>
    <p className="text-sm text-muted-foreground">ログイン不要です。投稿は管理者に届き、回答後に名前と内容が公開される場合があります。個人情報は記載しないでください。</p>
    <input type="hidden" name="kind" value={kind} /><input type="hidden" name="target" value={target} />
    <label className="block text-sm">お名前（任意・ニックネーム可）<input name="name" maxLength={80} defaultValue={state.values?.name} className={field} /></label>
    <label className="block text-sm">質問・コメント<textarea name="body" required maxLength={2000} rows={5} defaultValue={state.values?.body} className={field} /></label>
    <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button disabled={pending} className={buttonVariants()}>{pending ? "送信中…" : "質問・コメントを送る"}</button>
  </form>;
}

export function ModerateForm({ comment }) {
  const [state, action, pending] = useActionState(moderateComment, {});
  return <form action={action} className="mt-3 space-y-3"><input name="id" type="hidden" value={comment.id} />
    <label className="block text-sm">管理者からの回答<textarea name="answer" rows={4} maxLength={20000} defaultValue={comment.answer} className={field} /></label>
    <label className="flex items-center gap-2 text-sm"><input name="is_public" type="checkbox" defaultChecked={comment.is_public} />質問と回答を詳細ページに公開する</label>
    <button disabled={pending} className={buttonVariants({ variant: "outline" })}>回答・公開設定を保存</button>
    <p role="status" className="text-sm">{state.error || state.success}</p>
  </form>;
}

export function NotificationRetry({ id }) {
  const [state, action, pending] = useActionState(retryNotification, {});
  return <form action={action} className="mt-3"><input type="hidden" name="id" value={id} /><button disabled={pending} className={buttonVariants({ variant: "outline", size: "sm" })}>未送信のメール通知を再送</button><p role="status" className="text-sm">{state.error || state.success}</p></form>;
}
