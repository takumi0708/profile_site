import Link from "next/link";
import Markdown from "@/components/Markdown";
import Tags from "@/components/Tags";
import Comments from "@/components/Comments";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/lib/content";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function InterviewDetailPage({ params }) {
  const { id } = await params;
  const { data: question, error } = await getPublicContent("questions", id);
  if (error) throw new Error(error);
  if (!question) notFound();
  return <main className="mx-auto w-full max-w-5xl px-6 py-16">
    <h1 className="mb-6 text-2xl font-bold">Interview Q&A</h1>
    <Card><CardHeader><Badge variant="secondary">{question.category}</Badge><div className="mt-3 text-xl font-semibold"><Markdown>{question.question}</Markdown></div></CardHeader>
      <CardContent><Tags tags={question.tags} /><Markdown>{question.answer}</Markdown></CardContent>
    </Card>
    <Comments kind="questions" target={id} />
    <Link href="/interview" className={`${buttonVariants({ variant: "outline" })} mt-8`}>一覧に戻る</Link>
  </main>;
}
