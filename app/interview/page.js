// 質問データ
import { getPublicContent, getCategories } from "@/lib/content";
import { pageNumber } from "@/lib/profile-validation.mjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// 質問カード
import QuestionCard from "@/components/interview/QuestionCard";


export default async function InterviewPage({ searchParams }) {
    const params = await searchParams;
    const page = pageNumber(params.page);
    const category = typeof params.category === "string" ? params.category.slice(0, 50) : "";
    const pageUrl = number => `/interview?${new URLSearchParams({ ...(category ? { category } : {}), page: String(number) })}`;
    const [{ data: questions, error, count }, categories] = await Promise.all([getPublicContent("questions", undefined, page, category), getCategories()]);
    const totalPages = Math.max(1, Math.ceil((count || 0) / 10));
    if (!error && page > totalPages) redirect(pageUrl(totalPages));
    return (
        <main className="min-h-screen bg-background">

            {/* ページ全体の横幅 */}
            <div className="mx-auto max-w-5xl px-6 py-16">


                {/* ページタイトル */}
                <section className="mb-10">

                    <p className="mb-2 text-sm text-muted-foreground">
                        Interview
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Interview Q&A
                    </h1>

                    <p className="mt-4 max-w-2xl text-muted-foreground">
                        面接で聞かれそうな質問について、
                        自分の考えや経験をまとめています。
                    </p>

                </section>


                <nav aria-label="質問カテゴリ" className="mb-8 flex flex-wrap gap-2">
                    <Link href="/interview" aria-current={!category ? "page" : undefined} className={buttonVariants({ variant: !category ? "default" : "outline" })}>すべて</Link>
                    {categories.data.map(item => <Link key={item.category} href={`/interview?${new URLSearchParams({ category: item.category })}`} aria-current={category === item.category ? "page" : undefined} className={buttonVariants({ variant: category === item.category ? "default" : "outline" })}>{item.category}</Link>)}
                    <Link href="/questions" className={buttonVariants({ variant: "outline" })}>質問を送る</Link>
                </nav>
                {categories.error && <p className="mb-4 text-sm text-muted-foreground">カテゴリを取得できませんでした。</p>}
                {category && <h2 className="mb-4 text-lg font-semibold">カテゴリ：{category}</h2>}
                {/* Q&A一覧 */}
                <section className="grid gap-6">

                    {error ? <p role="status" className="text-muted-foreground">{error}</p> : questions.length === 0 ? <p className="text-muted-foreground">公開済みの質問はまだありません。</p> : questions.map((question) => (
                        // ここでReactで描画（mapで再利用するため）
                        <QuestionCard
                            key={question.id}
                            question={question}
                        />
                    ))}

                </section>

                {!error && <nav aria-label="質問一覧のページ" className="mt-8 flex items-center justify-between gap-4">
                    {page > 1 ? <Link href={pageUrl(page - 1)} className={buttonVariants({ variant: "outline" })}>← 前の10件</Link> : <span />}
                    <p className="text-sm text-muted-foreground">{page} / {totalPages} ページ（全{count || 0}件）</p>
                    {page < totalPages ? <Link href={pageUrl(page + 1)} className={buttonVariants({ variant: "outline" })}>次の10件 →</Link> : <span />}
                </nav>}
            </div>

        </main>
    );
}
