// Next.jsのページ遷移
import Link from "next/link";
import { getProfile } from "@/lib/content";
import Markdown from "@/components/Markdown";
import { parseProfileLinks } from "@/lib/profile-validation.mjs";

// shadcn/ui
// Button本体と、Buttonのデザインだけ使うためのbuttonVariants
import { buttonVariants } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default async function HomePage() {
  const { data: profile } = await getProfile();
  const links = (Array.isArray(profile.links) ? profile.links : []).flatMap(link => {
    try { return parseProfileLinks(`${link.label} | ${link.url}`); } catch { return []; }
  });
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ページ全体の横幅と余白 */}
      <div className="mx-auto max-w-5xl px-6 py-16">


        {/* =========================
            Hero
        ========================= */}
        <section className="mb-16">

          <p className="mb-3 text-sm text-muted-foreground">
            Interview Portfolio
          </p>

          <h1 className="mb-6 text-4xl font-bold tracking-tight">
            {profile.display_name}
          </h1>

          <div className="max-w-2xl text-lg leading-8 text-muted-foreground"><Markdown>{profile.bio}</Markdown></div>
          {links.length > 0 && <nav aria-label="プロフィールリンク" className="mt-6 flex flex-wrap gap-3">{links.map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>{link.label} ↗</a>)}</nav>}


          {/* ページ遷移ボタン */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/questions" className={buttonVariants({ variant: "outline" })}>質問コーナー</Link>

            {/* LinkにButtonのデザインを適用 */}
            <Link
              href="/interview"
              className={buttonVariants()}
            >
              Interview Q&A
            </Link>

            {/* outlineデザインのButton */}
            <Link
              href="/projects"
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Projects
            </Link>

          </div>

        </section>


        {/* =========================
            メニューカード
        ========================= */}
        <section className="grid gap-6 md:grid-cols-2">


          {/* Interview Card */}
          <Card>

            <CardHeader>

              <CardTitle>
                Interview Q&A
              </CardTitle>

              <CardDescription>
                面接で聞かれそうな質問について、
                自分の考えや経験をまとめています。
              </CardDescription>

            </CardHeader>

            <CardContent>

              <Link
                href="/interview"
                className={buttonVariants({
                  variant: "link",
                })}
              >
                Q&Aを見る →
              </Link>

            </CardContent>

          </Card>


          {/* Projects Card */}
          <Card>

            <CardHeader>

              <CardTitle>
                Projects
              </CardTitle>

              <CardDescription>
                これまで取り組んできた開発や研究を紹介します。
              </CardDescription>

            </CardHeader>

            <CardContent>

              <Link
                href="/projects"
                className={buttonVariants({
                  variant: "link",
                })}
              >
                Projectsを見る →
              </Link>

            </CardContent>

          </Card>

        </section>

        <footer className="mt-12 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:underline">管理者ダッシュボード</Link>
        </footer>
      </div>

    </main>
  );
}
