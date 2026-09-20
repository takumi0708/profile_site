import Link from "next/link";
import Markdown from "@/components/Markdown";
import Tags from "@/components/Tags";
import Comments from "@/components/Comments";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/lib/content";

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const { data: project, error } = await getPublicContent("projects", id);
  if (error) throw new Error(error);
  if (!project) notFound();
  return <main className="mx-auto w-full max-w-5xl px-6 py-16">
    <h1 className="mb-6 text-3xl font-bold">{project.title}</h1>
    <Markdown>{project.summary}</Markdown>
    <h2 className="mb-2 mt-8 text-xl font-semibold">使用技術</h2>
    <p>{project.technologies.join(" / ")}</p>
    <Tags tags={project.tags} />
    <Comments kind="projects" target={id} />
    <Link href="/projects" className="mt-8 inline-block underline">Projects一覧に戻る</Link>
  </main>;
}
