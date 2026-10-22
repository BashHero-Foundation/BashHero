import { notFound } from "next/navigation";
import { TypingView } from "@/components/TypingView";
import { allLevels } from "@/app/levelsUtils";

export const dynamicParams = false;

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const currentIndex = allLevels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? allLevels[currentIndex] : null;
  const nextLevelId = currentIndex >= 0 && currentIndex < allLevels.length - 1
    ? allLevels[currentIndex + 1].id
    : null;

  if (!level) {
    return notFound();
  }

  return <TypingView level={level} nextLevelId={nextLevelId} />;
}

export async function generateStaticParams() {
  return allLevels.map((level) => ({
    id: level.id.toString(),
  }));
}
