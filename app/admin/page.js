import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { logout } from "./actions";
import { QuestionForm, DeleteForm, ProjectForm, ProfileForm, NavigationForm } from "@/components/admin/Forms";
import { getProfile } from "@/lib/content";
import { ModerateForm, NotificationRetry } from "@/components/CommentForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminPage({ searchParams }) {
  if (!supabaseConfig()) redirect("/admin/login");
  const supabase = await requireAdmin();
  const { saved, edit, projectEdit, projectSaved, navEdit, navSaved } = await searchParams;
  const profile = await getProfile();
  const { data: navigation, error: navigationError } = await supabase.from("navigation_pages").select("*").order("sort_order").order("id");
  const { data: questions, error } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
  const selected = questions?.find((q) => String(q.id) === edit);
  const [{ data: projects, error: projectsError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("comments").select("*").order("created_at", { ascending: false }),
  ]);
  return <main className="mx-auto w-full max-w-5xl px-6 py-16">
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-2 text-sm text-muted-foreground">Admin</p><h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1></div>
      <div className="flex gap-3"><Link className={buttonVariants({ variant: "outline" })} href="/interview">公開ページ</Link><form action={logout}><button className={buttonVariants({ variant: "outline" })}>ログアウト</button></form></div>
    </div>
    <Card className="mb-8" id="navigation"><CardHeader><CardTitle>ヘッダーのボタン・ページ管理</CardTitle></CardHeader><CardContent>
      {navigationError ? <p role="alert">追加SQL（202609210007_navigation.sql）を実行してください。</p> : <>
        {navSaved && <p role="status" className="mb-4">ボタン・ページを保存しました。</p>}
        <p className="mb-4 text-sm text-muted-foreground">表示順が小さいボタンから並びます。同じ順番の場合は登録順です。独自ページの本文はMarkdownで編集できます。ボタンを削除すると独自ページの本文も削除されます。既存の質問・Projectsの内容は削除されません。</p>
        <div className="grid gap-8 md:grid-cols-2"><div><NavigationForm key={`${navEdit || "new"}-${navSaved || ""}`} page={navigation.find(item => String(item.id) === navEdit)} />{navEdit && <Link href="/admin#navigation" className="mt-4 block text-sm underline">新しいボタンを追加する</Link>}</div>
        <ul className="space-y-5">{navigation.map(item => <li key={item.id} className="border-b pb-4"><p className="text-xs text-muted-foreground">{item.is_public ? "公開中" : "下書き"} · 表示順 {item.sort_order}</p><Link href={`/admin?navEdit=${item.id}#navigation`} className="font-semibold underline">{item.label}</Link><DeleteForm table="navigation_pages" id={item.id} /></li>)}</ul></div>
      </>}
    </CardContent></Card>
    {saved && <p role="status" className="mb-6 text-sm">質問を保存しました。</p>}
    {error ? <p role="alert">質問を取得できませんでした。再度お試しください。</p> : <div className="grid items-start gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle>{selected ? "質問を編集" : "質問を登録"}</CardTitle></CardHeader><CardContent><QuestionForm key={selected ? `edit-${selected.id}` : `new-${saved || ""}`} question={selected} parents={questions} />{selected && <Link className="mt-4 block text-sm underline" href="/admin">新しい質問を登録する</Link>}</CardContent></Card>
      <Card><CardHeader><CardTitle>登録済みの質問（{questions.length}）</CardTitle></CardHeader><CardContent>
        {questions.length === 0 ? <p className="text-sm text-muted-foreground">まだ質問がありません。</p> : <ul className="space-y-4">{questions.map((q) => <li key={q.id} className="border-b pb-4 last:border-0"><p className="mb-1 text-xs text-muted-foreground">{q.is_public ? "公開中" : "下書き"} · {q.category}</p><Link href={`/admin?edit=${q.id}`} className="font-medium hover:underline">{q.question}</Link><DeleteForm table="questions" id={q.id} /></li>)}</ul>}
      </CardContent></Card>
    </div>}
    <Card className="mt-8" id="projects"><CardHeader><CardTitle>Projectsの管理</CardTitle></CardHeader><CardContent>
      {projectSaved && <p role="status" className="mb-4">プロジェクトを保存しました。</p>}
      {projectsError ? <p role="alert">Projectsを取得できませんでした。</p> : <div className="grid gap-8 md:grid-cols-2"><div><ProjectForm key={projectEdit ? `edit-${projectEdit}` : `new-${projectSaved || ""}`} project={projects.find(p => String(p.id) === projectEdit)} />{projectEdit && <Link href="/admin#projects" className="mt-4 block text-sm underline">新しいプロジェクトを登録する</Link>}</div><div>{projects.length === 0 ? <p>まだプロジェクトがありません。</p> : projects.map(p => <article key={p.id} className="mb-6 border-b pb-6"><p className="text-xs text-muted-foreground">{p.is_public ? "公開中" : "下書き"}</p><Link href={`/admin?projectEdit=${p.id}#projects`} className="font-semibold underline">{p.title}</Link><DeleteForm table="projects" id={p.id} /></article>)}</div></div>}
    </CardContent></Card>
    <Card className="mt-8"><CardHeader><CardTitle>トップページの自己紹介・リンク</CardTitle></CardHeader><CardContent>{profile.error ? <p role="alert">プロフィール設定を読み込めません。追加SQL（202609200004_profile.sql）を実行してください。</p> : <ProfileForm profile={profile.data} />}</CardContent></Card>
    <Card className="mt-8"><CardHeader><CardTitle>閲覧者からの質問・コメント</CardTitle></CardHeader><CardContent>
      <p className="mb-4 text-sm text-muted-foreground">投稿を削除すると、その投稿に届いたコメントも削除されます。親質問の削除時は子質問を独立した質問として残します。</p>
      {commentsError ? <p role="alert">コメントを取得できません。追加SQLの実行を確認してください。</p> : comments.length === 0 ? <p>まだコメントがありません。</p> : comments.map(c => <article key={c.id} className="mb-8 rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">{c.is_public ? "公開中" : "非公開"} · {c.notification_sent_at ? "メール通知済み" : "メール未送信"}</p>
        <Link className="text-sm underline" href={c.is_general ? "/questions" : c.question_id ? `/interview/${c.question_id}` : `/projects/${c.project_id}`}>{c.is_general ? "質問コーナーからの投稿" : "投稿元を見る"}</Link>
        <p className="my-2 text-sm">{c.author_name || "匿名"} · {new Date(c.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>
        <p className="whitespace-pre-wrap break-words">{c.body}</p>
        <ModerateForm comment={c} />{!c.notification_sent_at && <NotificationRetry id={c.id} />}<DeleteForm table="comments" id={c.id} />
      </article>)}
    </CardContent></Card>
  </main>;
}
