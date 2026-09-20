// プロジェクトデータを読み込む
import { getPublicContent } from "@/lib/content";

import Link from "next/link";
import Tags from "@/components/Tags";
import { markdownPreview } from "@/lib/markdown.mjs";


export default async function ProjectsPage() {
    const { data: projects, error } = await getPublicContent("projects");

    return (
        <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-16">

            {/* ページタイトル */}
            <h1>
                Projects
            </h1>

            <p>
                これまで取り組んできた開発・研究をまとめています。
            </p>


            {/* projects配列を1件ずつ表示する */}
            {error ? <p role="status">{error}</p> : projects.length === 0 ? <p>公開済みのプロジェクトはまだありません。</p> : projects.map((project) => {

                return (
                    <div key={project.id} className="space-y-4 rounded-xl border p-6">
                        <Tags tags={project.tags} />

                        {/* プロジェクト名 */}
                        <h2>
                            {project.title}
                        </h2>


                        {/* 概要 */}
                        <p>
                            {markdownPreview(project.summary, 120)}
                        </p>


                        {/* 使用技術 */}
                        {/* 配列をPython / Docker / Azureのように表示 */}
                        <p>
                            使用技術：
                            {project.technologies.join(" / ")}
                        </p>

                        {/* プロジェクトの詳細ページに飛ぶ */}
                        <Link href={`/projects/${project.id}`}>
                            詳しく見る
                        </Link>

                    </div>
                );

            })}

        </main>
    );
}
