// プロジェクトデータを読み込む
import { projects } from "@/data/projects";

import Link from "next/link";


export default function ProjectsPage() {

    return (
        <main>

            {/* ページタイトル */}
            <h1>
                Projects
            </h1>

            <p>
                これまで取り組んできた開発・研究をまとめています。
            </p>


            {/* projects配列を1件ずつ表示する */}
            {projects.map((project) => {

                return (
                    <div key={project.id}>

                        {/* プロジェクト名 */}
                        <h2>
                            {project.title}
                        </h2>


                        {/* 概要 */}
                        <p>
                            {project.summary}
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