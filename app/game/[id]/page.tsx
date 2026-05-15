import { notFound } from "next/navigation";
import levelsData from "../../levels/chapter1.json";
import { TypingView } from "@/components/TypingView";

export const dynamicParams = false;

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const levels = levelsData.levels;
  const currentIndex = levels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? levels[currentIndex] : null;
  const nextLevelId = currentIndex >= 0 && currentIndex < levels.length - 1 
    ? levels[currentIndex + 1].id
    : null;

  if (!level) {
    return notFound();
  }

  return <TypingView level={level} nextLevelId={nextLevelId} />;
}

export async function generateStaticParams() {
  return levelsData.levels.map((level) => ({
    id: level.id.toString(),
  }));
}

