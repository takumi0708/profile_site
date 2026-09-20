import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicContent } from "@/lib/content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function InterviewDetailPage({ params }) {
  const { id } = await params;
  const { data: question, error } = await getPublicContent("questions", id);
  if (error) throw new Error(error);
  if (!question) notFound();
  return <main className="mx-auto w-full max-w-5xl px-6 py-16">
    <Card><CardHeader><Badge variant="secondary">{question.category}</Badge><CardTitle className="mt-3 text-2xl leading-relaxed">Q. {question.question}</CardTitle></CardHeader>
      <CardContent><p className="whitespace-pre-wrap break-words leading-8">{question.answer}</p></CardContent>
    </Card>
    <Link href="/interview" className={`${buttonVariants({ variant: "outline" })} mt-8`}>一覧に戻る</Link>
  </main>;
}
