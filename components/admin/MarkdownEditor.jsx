"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Markdown from "@/components/Markdown";
import { buttonVariants } from "@/components/ui/button";

export default function MarkdownEditor({ name, label, defaultValue = "", maxLength = 20000, rows = 8, required = false, images = true }) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploading = useRef(false);
  const container = useRef(null);
  useEffect(() => {
    const form = container.current?.closest("form");
    function guard(event) {
      if (uploading.current || value.length > maxLength) {
        event.preventDefault();
        setError(uploading.current ? "アップロード完了後に保存してください。" : `本文を${maxLength}文字以内にしてください。`);
      }
    }
    form?.addEventListener("submit", guard);
    return () => form?.removeEventListener("submit", guard);
  }, [value, maxLength]);
  async function upload(file) {
    if (!file || uploading.current) return;
    const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
    if (!extensions[file.type] || file.size > 5 * 1024 * 1024) { setError("PNG・JPEG・WebPの5MB以下の画像を選んでください。"); return; }
    uploading.current = true; setBusy(true); setError("");
    try {
      const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
      const path = `${crypto.randomUUID()}.${extensions[file.type]}`;
      const { error } = await client.storage.from("screenshots").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = client.storage.from("screenshots").getPublicUrl(path);
      setValue(current => `${current}\n\n![スクリーンショット](${data.publicUrl})\n`);
      setPreview(false);
    } catch { setError("アップロードできませんでした。ログイン状態と画像用SQLの実行を確認してください。"); }
    finally { uploading.current = false; setBusy(false); }
  }
  return <div ref={container} className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><button type="button" aria-pressed={preview} className={buttonVariants({ variant: "outline", size: "sm" })} onClick={() => setPreview(!preview)}>{preview ? "編集に戻る" : "プレビュー"}</button></div>
    <textarea id={id} name={name} value={value} onChange={event => setValue(event.target.value)} rows={rows} required={required} maxLength={maxLength} readOnly={busy} className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${preview ? "sr-only" : ""}`} onPaste={event => { if (!images) return; const file = Array.from(event.clipboardData.files).find(file => file.type.startsWith("image/")); if (file) { event.preventDefault(); void upload(file); } }} />
    {preview && <div className="min-h-24 rounded-lg border p-4">{value ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted-foreground">本文を入力するとプレビューできます。</p>}</div>}
    {images && <><label className="block text-sm">スクリーンショットを追加<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="mt-2 block w-full text-sm" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label><p className="text-xs text-muted-foreground">画像の貼り付けにも対応。画像はアップロード時点でURLから閲覧できます。本文の画像記法を消してもStorageには残ります。</p></>}
    {busy && <p role="status" className="text-sm">画像をアップロード中です。完了してから保存してください。</p>}
    {value.length > maxLength && <p role="alert" className="text-sm text-destructive">本文を{maxLength}文字以内にしてください。</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
