"use client";

import { useActionState, useState } from "react";
import { login, saveQuestion, deletePost, saveProjectTags, saveProject, saveProfile } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import MarkdownEditor from "@/components/admin/MarkdownEditor";

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
      <MarkdownEditor name="question" label="質問（Markdown）" rows={3} defaultValue={values.question} maxLength={500} required images={false} />
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
      <MarkdownEditor name="answer" label="回答（Markdown）" defaultValue={values.answer} />
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
    <MarkdownEditor name="summary" label="本文（Markdown）" defaultValue={values.summary} rows={10} required />
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
  const [linksText, setLinksText] = useState(() => Array.isArray(profile.links) ? profile.links.map(link => `${link.label} | ${link.url}${link.color ? ` | ${link.color}` : ""}`).join("\n") : profile.links || "");
  return <form action={action} className="space-y-4">
    <label className="block text-sm">表示名<input name="display_name" required maxLength={100} className={inputClass} defaultValue={values.display_name} /></label>
    <MarkdownEditor name="bio" label="自己紹介（Markdown）" maxLength={5000} rows={5} defaultValue={values.bio} />
    <label className="block text-sm">紹介リンク（1行に1件・10件まで）<textarea name="links" rows={5} className={inputClass} value={linksText} onChange={event => setLinksText(event.target.value)} placeholder={"X | https://x.com/yourname\nGitHub | https://github.com/yourname | #2563eb"} /></label>
    <p className="text-xs text-muted-foreground">名前 | URL | 色 の形式です。色は省略できます。下の色選択からリンクごとに変更できます。</p>
    <div className="flex flex-wrap gap-4">{linksText.split("\n").map((line, index) => {
      if (!line.trim()) return null;
      const parts = line.split("|").map(value => value.trim());
      const color = /^#[0-9a-fA-F]{6}$/.test(parts[2] || "") ? parts[2] : "#171717";
      return <label key={index} className="flex items-center gap-2 text-sm"><input type="color" aria-label={`${parts[0] || "リンク"}の文字色`} value={color} onChange={event => { const chosen = event.target.value; setLinksText(current => current.split("\n").map((text, row) => row === index ? `${text.split("|").slice(0, 2).join("|").trim()} | ${chosen}` : text).join("\n")); }} /><span style={{ color }}>{parts[0] || "リンク"} ↗</span></label>;
    })}</div>
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
