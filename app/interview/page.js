// 質問データ
import { getPublicContent } from "@/lib/content";

// 質問カード
import QuestionCard from "@/components/interview/QuestionCard";


export default async function InterviewPage() {
    const { data: questions, error } = await getPublicContent("questions");
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

            </div>

        </main>
    );
}
