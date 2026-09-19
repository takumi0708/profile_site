// Next.jsのページ遷移
import Link from "next/link";

// shadcn/ui の見た目を使う
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { buttonVariants } from "@/components/ui/button";

// QuestionCardコンポーネント
// 親コンポーネントから question というデータを受け取る
export default function QuestionCard({ question }) {
    return (
        <Card>

            {/* 上部：カテゴリと質問文 */}
            <CardHeader>

                {/* 質問カテゴリ */}
                <div className="mb-2">
                    <Badge variant="secondary">
                        {question.category}
                    </Badge>
                </div>


                {/* 質問タイトル */}
                <CardTitle className="text-xl leading-relaxed">
                    {question.question}
                </CardTitle>

            </CardHeader>


            {/* 下部：詳細ページへのリンク */}
            <CardContent>

                <Link
                    href={`/interview/${question.id}`}
                    className={buttonVariants({
                        variant: "outline",
                    })}
                >
                    回答を見る
                </Link>

            </CardContent>

        </Card>
    );
}