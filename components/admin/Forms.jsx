"use client";

import { useActionState } from "react";
import { login, saveQuestion, deletePost, saveProjectTags, saveProject, saveProfile } from "@/app/admin/actions";
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
      <label className="block text-sm font-medium">質問（Markdown対応）<textarea name="question" rows={3} className={inputClass} defaultValue={values.question} maxLength={500} required /></label>
      <label className="block text-sm font-medium">カテゴリ
        <input name="category" className={inputClass} defaultValue={values.category || "career"} maxLength={50} list="categories" required />
        <datalist id="categories"><option value="career" /><option value="self" /><option value="technical" /></datalist>
      </label>
      <label className="block text-sm font-medium">タグ（カンマ区切り・10個まで）<input name="tags" className={inputClass} defaultValue={Array.isArray(values.tags) ? values.tags.join(", ") : values.tags || ""} placeholder="React, 研究, キャリア" /></label>
      {!question && <label className="block text-sm font-medium">親質問（任意）
        <select name="parent_id" className={inputClass} defaultValue={values.parent_id || ""}>
          <option value="">なし</option>
          {parents.map((item) => <option key={item.id} value={item.id}>{item.question}</option>)}
        </select>
      </label>}
      <label className="block text-sm font-medium">回答（Markdown対応）<textarea name="answer" className={inputClass} rows={8} maxLength={20000} defaultValue={values.answer} /></label>
      <MarkdownHelp />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_public" defaultChecked={values.is_public || false} />回答を公開する</label>
      <p className="text-sm text-muted-foreground">回答がない質問は下書きとして保存できます。</p>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button className={buttonVariants()} disabled={pending}>{pending ? "保存中…" : question ? "変更を保存" : "質問を登録"}</button>
    </form>
  );
}

function MarkdownHelp() {
  return <p className="text-xs text-muted-foreground">見出し：## 見出し ／ 太字：**文字** ／ 箇条書き：- 項目 ／ リンク：[名前](https://...) ／ コード：```で囲む</p>;
}

export function ProjectForm({ project }) {
  const [state, action, pending] = useActionState(saveProject, {});
  const values = state.values || project || {};
  return <form action={action} className="space-y-4">
    {project && <input type="hidden" name="id" value={project.id} />}
    <label className="block text-sm">タイトル<input name="title" className={inputClass} defaultValue={values.title} maxLength={200} required /></label>
    <label className="block text-sm">本文（Markdown対応）<textarea name="summary" className={inputClass} defaultValue={values.summary} rows={10} maxLength={20000} required /></label>
    <MarkdownHelp />
    <label className="block text-sm">使用技術（カンマ区切り・10個まで）<input name="technologies" className={inputClass} defaultValue={Array.isArray(values.technologies) ? values.technologies.join(", ") : values.technologies || ""} /></label>
    <label className="block text-sm">タグ（カンマ区切り・10個まで）<input name="tags" className={inputClass} defaultValue={Array.isArray(values.tags) ? values.tags.join(", ") : values.tags || ""} /></label>
    <label className="flex items-center gap-2 text-sm"><input name="is_public" type="checkbox" defaultChecked={values.is_public || false} />公開する</label>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button disabled={pending} className={buttonVariants()}>{pending ? "保存中…" : project ? "変更を保存" : "プロジェクトを登録"}</button>
  </form>;
}

export function ProfileForm({ profile }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  const values = state.values || profile;
  return <form action={action} className="space-y-4">
    <label className="block text-sm">表示名<input name="display_name" required maxLength={100} className={inputClass} defaultValue={values.display_name} /></label>
    <label className="block text-sm">自己紹介（Markdown対応）<textarea name="bio" maxLength={5000} rows={5} className={inputClass} defaultValue={values.bio} /></label>
    <label className="block text-sm">紹介リンク（1行に1件・10件まで）<textarea name="links" rows={5} className={inputClass} defaultValue={Array.isArray(values.links) ? values.links.map(link => `${link.label} | ${link.url}`).join("\n") : values.links} placeholder={"X | https://x.com/yourname\nGitHub | https://github.com/yourname"} /></label>
    <p className="text-xs text-muted-foreground">名前 | URL の形式で入力します。行を追加・変更・削除すると、トップページのリンクに反映されます。</p>
    <p role="status" className="text-sm">{state.error || state.success}</p>
    <button disabled={pending} className={buttonVariants()}>{pending ? "保存中…" : "自己紹介・リンクを保存"}</button>
  </form>;
}

export function DeleteForm({ table, id }) {
  const [state, action, pending] = useActionState(deletePost, {});
  return <form action={action} className="mt-4 space-y-2 border-t pt-3">
    <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />
    <label className="flex items-center gap-2 text-xs"><input name="confirm" type="checkbox" required />この投稿を完全に削除する（元に戻せません）</label>
    <button disabled={pending} className={buttonVariants({ variant: "destructive", size: "sm" })}>{pending ? "削除中…" : "削除"}</button>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
  </form>;
}

export function ProjectTagsForm({ project }) {
  const [state, action, pending] = useActionState(saveProjectTags, {});
  return <form action={action} className="mt-3 space-y-2"><input type="hidden" name="id" value={project.id} />
    <label className="block text-sm">タグ（カンマ区切り）<input name="tags" className={inputClass} defaultValue={(project.tags || []).join(", ")} /></label>
    <button disabled={pending} className={buttonVariants({ variant: "outline", size: "sm" })}>タグを保存</button>
    <p role="status" className="text-sm">{state.error || state.success}</p>
  </form>;
}
