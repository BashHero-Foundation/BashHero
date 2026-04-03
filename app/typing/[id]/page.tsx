import levelsData from "../../levels/chapter1.json";
import { TypingView } from "@/components/TypingView";

export default async function Page({ params }: { params: { id: string } }) {
  const {id} = await params
  const level = levelsData.levels.find(l => l.id === id);
  console.log(params.id);

  if (!level) {
    return <h1 className="flex justify-center text-4xl text-gray-300"> Level not found :(</h1>;
  }

  return <TypingView level={level} />;
}