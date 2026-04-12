import TypingArea from "./typing/page";
import ScormStatus from "./scorm/scorm_utils";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col justify-center items-center p-10 bg-amber-50">
        <h1 className="font-retro text-3xl text-yellow-400 mb-2">BASH HERO </h1>
        <p className="font-retro text-sm text-gray-400 tracking-widest"> your way to become a programist</p>
      </div>

      <div>
        <TypingArea></TypingArea>
      </div>
      <ScormStatus></ScormStatus>
    </div>
  );
}
