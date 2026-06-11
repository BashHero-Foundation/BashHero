import { notFound } from "next/navigation";
import levelsData from "../../levels/chapter1.json";
import chapter1 from "../../levels/chapter1.json";
import chapter2 from "../../levels/chapter2.json";
import chapter3 from "../../levels/chapter3.json";
import chapter4 from "../../levels/chapter4.json";
import chapter5 from "../../levels/chapter5.json";
import { TypingView } from "@/components/TypingView";

const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];
const alllevels = chapters.flatMap(chapter => chapter.levels);

export const dynamicParams = false;

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const currentIndex = alllevels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? alllevels[currentIndex] : null;
  const nextLevelId = currentIndex >= 0 && currentIndex < alllevels.length - 1 
    ? alllevels[currentIndex + 1].id
    : null;

  if (!level) {
    return notFound();
  }

  return <TypingView level={level} nextLevelId={nextLevelId} />;
}

export async function generateStaticParams() {
  return alllevels.map((level) => ({
    id: level.id.toString(),
  }));
}

