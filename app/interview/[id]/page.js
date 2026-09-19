/*
各IDごとの質問だけの詳細ページ
*/

// 質問データを読み込む
import { questions } from "@/data/questions";

// Next.jsで別ページへ戻るためにLinkを使う
import Link from "next/link";


// 詳細ページ
// params にIDが入る
// 待つ処理にはasyncを使う
export default async function InterviewDetailPage({ params }) {

    // URLの[id]部分を取得する
    // 例: /interview/1 なら id は "1"
    const { id } = await params;


    // URLから取得したidは文字列なので、数字に変換する
    const questionId = Number(id);


    // questions配列の中から、
    // idが一致する質問を1件ずつ探す
    const question = questions.find(
        // questionsを1つずつ見るときitemに入れる
        (item) => item.id === questionId
    );


    // 該当する質問が見つからなかった場合
    if (!question) {
        return (
            <main>

                <h1>
                    質問が見つかりません
                </h1>

                <Link href="/interview">
                    一覧に戻る
                </Link>

            </main>
        );
    }


    // 質問が見つかった場合
    return (
        <main>

            {/* 質問カテゴリ */}
            <p>
                {question.category}
            </p>


            {/* 質問文 */}
            <h1>
                Q. {question.question}
            </h1>


            {/* 回答 */}
            <p>
                A. {question.answer}
            </p>


            {/* 一覧ページへ戻る */}
            <Link href="/interview">
                一覧に戻る
            </Link>

        </main>
    );
}