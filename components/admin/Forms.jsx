"use client";

import { useActionState } from "react";
import { login, saveQuestion } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";

const inputClass = "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="space-y-5">
      <label className="block text-sm font-medium">メールアドレス<input className={inputClass} name="email" type="email" autoComplete="username" required /></label>
      <label className="block text-sm font-medium">パスワード<input className={inputClass} name="password" type="password" autoComplete="current-password" required /></label>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button className={buttonVariants()} disabled={pending}>{pending ? "ログイン中…" : "ログイン"}</button>
    </form>
  );
}

export function QuestionForm({ question, parents = [] }) {
  const [state, action, pending] = useActionState(saveQuestion, {});
  const values = state.values || question || {};
  return (
    <form action={action} className="space-y-5">
      {question && <input type="hidden" name="id" value={question.id} />}
      <label className="block text-sm font-medium">質問<input name="question" className={inputClass} defaultValue={values.question} maxLength={500} required /></label>
      <label className="block text-sm font-medium">カテゴリ
        <select name="category" className={inputClass} defaultValue={values.category || "career"}>
          <option value="career">キャリア</option><option value="self">自己紹介</option><option value="technical">技術</option>
        </select>
      </label>
      {!question && <label className="block text-sm font-medium">親質問（任意）
        <select name="parent_id" className={inputClass} defaultValue={values.parent_id || ""}>
          <option value="">なし</option>
          {parents.map((item) => <option key={item.id} value={item.id}>{item.question}</option>)}
        </select>
      </label>}
      <label className="block text-sm font-medium">回答<textarea name="answer" className={inputClass} rows={8} maxLength={20000} defaultValue={values.answer} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_public" defaultChecked={values.is_public || false} />回答を公開する</label>
      <p className="text-sm text-muted-foreground">回答がない質問は下書きとして保存できます。</p>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button className={buttonVariants()} disabled={pending}>{pending ? "保存中…" : question ? "変更を保存" : "質問を登録"}</button>
    </form>
  );
}
