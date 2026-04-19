import { notFound } from "next/navigation";
import levelsData from "../../levels/chapter1.json";
import { TypingView } from "@/components/TypingView";

export const dynamicParams = false;

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const level = levelsData.levels.find(l => l.id === id);

  if (!level) {
    return notFound();
  }

  return <TypingView level={level} />;
}

export async function generateStaticParams() {
  return levelsData.levels.map((level) => ({
    id: level.id.toString(),
  }));
}

