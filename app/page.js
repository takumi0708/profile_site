import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>トップページ</h1>
      <p>Next.jsの練習中です。</p>

      <Link href="/survey">surveyページへ</Link>
    </div>
  );
}