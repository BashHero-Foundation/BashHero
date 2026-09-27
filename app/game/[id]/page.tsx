import { notFound } from "next/navigation";
import { TypingView } from "@/components/TypingView";
import { alllevels } from "@/app/levelsUtils";

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
