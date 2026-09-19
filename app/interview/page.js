// 質問データを読み込む
import { questions } from "@/data/questions";

// 質問カードの部品を読み込む
import QuestionCard from "@/components/interview/QuestionCard";


export default function InterviewPage() {

    return (
        <main>

            {/* ページタイトル */}
            <h1>
                Interview Q&A
            </h1>


            {/* ページ説明 */}
            <p>
                面接で聞かれそうな質問と回答をまとめています。
            </p>


            {/* questions配列を1件ずつ取り出して表示する */}
            {questions.map((question) => {

                return (
                    <QuestionCard
                        key={question.id}
                        question={question}
                    />
                );

            })}

        </main>
    );
}