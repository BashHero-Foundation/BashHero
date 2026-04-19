import ScormStatus from "./scorm/scorm_utils";

export default function Home() {
  return (
    <div>
      <div className="flex justify-center mt-20">
        <h1 className="text-5xl text-text-secondary font-retro"> <a href="/game/1"> !! P L A Y !!</a> </h1>
      </div>

      <div className="mt-40 px-10 text-xs"> 
        <ScormStatus></ScormStatus>
      </div>

    </div>
  );
}
