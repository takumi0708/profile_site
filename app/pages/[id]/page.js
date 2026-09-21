import { notFound, redirect } from "next/navigation";
import { getNavigation } from "@/lib/content";
import Markdown from "@/components/Markdown";

export default async function ContentPage({ params }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const { data, error } = await getNavigation();
  if (error) throw new Error("ページを取得できませんでした。時間をおいて再度お試しください。");
  const page = data.find(item => String(item.id) === id);
  if (!page) notFound();
  if (page.href) redirect(page.href);
  return <main className="mx-auto w-full max-w-5xl px-6 py-16"><h1 className="mb-8 text-3xl font-bold">{page.label}</h1><Markdown>{page.body}</Markdown></main>;
}
