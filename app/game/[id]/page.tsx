import levelsData from "../../levels/chapter1.json";
import { TypingView } from "@/components/TypingView";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const level = levelsData.levels.find(l => l.id === id);

  if (!level) {
    notFound();
  }

  return <TypingView level={level} />
  
}

export async function generateStaticParams() {
  return levelsData.levels.map((level) => ({
    id: level.id.toString(),
  }));
}