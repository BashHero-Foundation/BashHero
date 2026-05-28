import { StatsPageContent } from "@/components/StatsPageContent";
import levelsData from "../../../levels/chapter1.json";
import { notFound } from "next/navigation";
import chapter1 from "../../../levels/chapter1.json";
import chapter2 from "../../../levels/chapter2.json";
import chapter3 from "../../../levels/chapter3.json";

const chapters = [chapter1, chapter2, chapter3];
const alllevels = chapters.flatMap(chapter => chapter.levels);

export const dynamicParams = false;

interface StatsPageProps {
  params: Promise<{ id: string }>;
}



export default async function StatsPage({ params }: StatsPageProps) {
  const { id } = await params;
  const currentIndex = alllevels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? alllevels[currentIndex] : null;
  const nextLevelId = currentIndex >= 0 && currentIndex < alllevels.length - 1 
    ? alllevels[currentIndex + 1].id
    : null;

  if (!level) {
    return (
      notFound()
    );
  }

  return <StatsPageContent level={level} />;
}

// necessary for export
export async function generateStaticParams() {
  return alllevels.map((level) => ({
    id: level.id.toString(),
  }));
}

