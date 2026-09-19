// Next.jsのページ遷移
import Link from "next/link";

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


export default function HomePage() {
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
            Takumi
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            面接で聞かれそうな質問への回答や、
            開発経験・研究内容をまとめています。
          </p>


          {/* ページ遷移ボタン */}
          <div className="mt-8 flex gap-3">

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

      </div>

    </main>
  );
}