import { StatsPageContent } from "@/components/StatsPageContent";
import levelsData from "../../../levels/chapter1.json";
import { notFound } from "next/navigation";

export const dynamicParams = false;

interface StatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { id } = await params;
  const level = levelsData.levels.find(l => l.id === id);

  if (!level) {
    notFound();
  }

  return <StatsPageContent level={level} />;
}

// necessary for export
export async function generateStaticParams() {
  return levelsData.levels.map((level) => ({
    id: level.id,
  }));
}

