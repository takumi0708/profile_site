"use client";

import { useState } from "react";
import Link from "next/link";

export default function Survey() {
    const [answer, setAnswer] = useState("hello");
    const technologies = ["JavaScript", "React", "Next.js"];

    return (

        <div className="p-8">
            <h1>アンケートページ</h1>
            <p>ここでアンケートに回答します。</p>

            <p>好きな技術は？</p>

            <div className="flex gap-2">
                {technologies.map((technology) => (
                    <button
                        key={technology}
                        onClick={() => setAnswer(technology)}
                        className={
                            answer === technology
                                ? "border p-2 bg-blue-500 text-white"
                                : "border p-2"
                        }
                    >
                        {technology}
                    </button>
                ))}
            </div>


            <p>あなたの回答：{answer}</p>

            <Link href="/results">結果を見る</Link>
        </div>
    );
}