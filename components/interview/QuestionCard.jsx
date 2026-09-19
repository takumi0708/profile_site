// Next.jsでページ遷移するためにLinkを使う
import Link from "next/link";


// QuestionCardコンポーネント
// 親コンポーネントから question というデータを受け取る
export default function QuestionCard({ question }) {

    return (
        <div>

            {/* 質問のカテゴリを表示 */}
            <p>
                {question.category}
            </p>


            {/* 質問文を表示 */}
            <h2>
                {question.question}
            </h2>


            {/* 質問の詳細ページへ移動する */}
            {/* idが1なら /interview/1 に移動する */}
            <Link href={`/interview/${question.id}`}>
                回答を見る
            </Link>

        </div>
    );
}