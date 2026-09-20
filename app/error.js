"use client";

export default function ErrorPage({ reset }) {
  return <main className="mx-auto max-w-5xl px-6 py-16">
    <h1 className="text-2xl font-bold">ページを読み込めませんでした</h1>
    <p className="my-4 text-muted-foreground">時間をおいて再度お試しください。</p>
    <button onClick={() => reset()} className="rounded-lg border px-4 py-2">再試行</button>
  </main>;
}
