import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { logout } from "./actions";
import { QuestionForm } from "@/components/admin/Forms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminPage({ searchParams }) {
  if (!supabaseConfig()) redirect("/admin/login");
  const supabase = await requireAdmin();
  const { saved, edit } = await searchParams;
  const { data: questions, error } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
  const selected = questions?.find((q) => String(q.id) === edit);
  return <main className="mx-auto w-full max-w-5xl px-6 py-16">
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-2 text-sm text-muted-foreground">Admin</p><h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1></div>
      <div className="flex gap-3"><Link className={buttonVariants({ variant: "outline" })} href="/interview">公開ページ</Link><form action={logout}><button className={buttonVariants({ variant: "outline" })}>ログアウト</button></form></div>
    </div>
    {saved && <p role="status" className="mb-6 text-sm">質問を保存しました。</p>}
    {error ? <p role="alert">質問を取得できませんでした。再度お試しください。</p> : <div className="grid items-start gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle>{selected ? "質問を編集" : "質問を登録"}</CardTitle></CardHeader><CardContent><QuestionForm key={selected?.id || "new"} question={selected} parents={questions} />{selected && <Link className="mt-4 block text-sm underline" href="/admin">新しい質問を登録する</Link>}</CardContent></Card>
      <Card><CardHeader><CardTitle>登録済みの質問（{questions.length}）</CardTitle></CardHeader><CardContent>
        {questions.length === 0 ? <p className="text-sm text-muted-foreground">まだ質問がありません。</p> : <ul className="space-y-4">{questions.map((q) => <li key={q.id} className="border-b pb-4 last:border-0"><p className="mb-1 text-xs text-muted-foreground">{q.is_public ? "公開中" : "下書き"} · {q.category}</p><Link href={`/admin?edit=${q.id}`} className="font-medium hover:underline">{q.question}</Link></li>)}</ul>}
      </CardContent></Card>
    </div>}
  </main>;
}
