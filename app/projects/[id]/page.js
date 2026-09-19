/*
プロジェクトごとの詳細ページ
*/

// プロジェクトデータを読み込む
import { projects } from "@/data/projects";

// 一覧へ戻るためにLinkを使う
import Link from "next/link";


export default async function ProjectDetailPage({ params }) {

    // URLの[id]部分を取得する
    // 例: /projects/1 → id = "1"
    const { id } = await params;


    // URLから取得したidは文字列なので数字に変換する
    const projectId = Number(id);


    // projects配列からidが一致するものを1件探す
    const project = projects.find(
        (item) => item.id === projectId
    );


    // 該当するプロジェクトがない場合
    if (!project) {
        return (
            <main>

                <h1>
                    プロジェクトが見つかりません
                </h1>

                <Link href="/projects">
                    Projects一覧に戻る
                </Link>

            </main>
        );
    }


    // プロジェクトが見つかった場合
    return (
        <main>

            {/* プロジェクト名 */}
            <h1>
                {project.title}
            </h1>


            {/* プロジェクト概要 */}
            <p>
                {project.summary}
            </p>


            {/* 使用技術 */}
            <h2>
                使用技術
            </h2>

            <p>
                {project.technologies.join(" / ")}
            </p>


            {/* 一覧へ戻る */}
            <Link href="/projects">
                Projects一覧に戻る
            </Link>

        </main>
    );
}

