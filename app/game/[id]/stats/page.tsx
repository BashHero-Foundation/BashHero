import { StatsPageContent } from "@/components/StatsPageContent";
import { notFound } from "next/navigation";
import { allLevels } from "@/app/levelsUtils";

export const dynamicParams = false;

interface StatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { id } = await params;
  const currentIndex = allLevels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? allLevels[currentIndex] : null;

  if (!level) {
    return (
      notFound()
    );
  }

  return <StatsPageContent level={level} />;
}

// necessary for export
export async function generateStaticParams() {
  return allLevels.map((level) => ({
    id: level.id.toString(),
  }));
}
