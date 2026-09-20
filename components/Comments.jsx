import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";
import { CommentForm } from "@/components/CommentForm";

export default async function Comments({ kind, target }) {
  const config = supabaseConfig();
  if (!config) return <p>質問コーナーは準備中です。</p>;
  const client = createClient(config.url, config.key, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.rpc("public_comments", { p_kind: kind, p_target: target });
  return <section className="mt-10">
    <h2 className="text-xl font-semibold">{kind === "general" ? "みなさんからの質問と回答" : "追加の質問と回答"}</h2>
    {error ? <p className="mt-3 text-sm text-muted-foreground">コメント機能は準備中です。</p> : <>
      {data.length === 0 && <p className="mt-3 text-sm text-muted-foreground">公開済みの質問はまだありません。</p>}
      {data.map(c => <article key={c.id} className="mt-4 space-y-3 rounded-xl border p-5"><p className="text-sm text-muted-foreground">{c.author_name || "匿名"}</p><p className="whitespace-pre-wrap break-words">Q. {c.body}</p><p className="whitespace-pre-wrap break-words border-t pt-3">A. {c.answer}</p></article>)}
      {process.env.SUPABASE_SERVICE_ROLE_KEY ? <CommentForm kind={kind} target={target} /> : <p className="mt-4 text-sm text-muted-foreground">質問の受付は準備中です。</p>}
    </>}
  </section>;
}
