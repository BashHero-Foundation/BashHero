import { StatsPageContent } from "@/components/StatsPageContent";
import { notFound } from "next/navigation";
import { alllevels } from "@/app/levelsUtils";

export const dynamicParams = false;

interface StatsPageProps {
  params: Promise<{ id: string }>;
}



export default async function StatsPage({ params }: StatsPageProps) {
  const { id } = await params;
  const currentIndex = alllevels.findIndex(l => l.id === id);
  const level = currentIndex >= 0 ? alllevels[currentIndex] : null;

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
