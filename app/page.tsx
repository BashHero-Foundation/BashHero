"use client";
import { scormify_path } from "./scorm/scorm_utils";

export default function Home() {

  return (
    <div>
      <div className="flex justify-center mt-20">
        <a
          href={scormify_path("/game/1")}
          className="relative text-5xl font-retro px-8 py-6 border-4 border-text-secondary text-text-secondary rounded-4xl 
          animate-bounce shadow-2xl hover:animate-pulse hover:scale-110 transition-all duration-75"
        >
          !! P L A Y !!
        </a>
      </div>
      <div className="mt-40 px-10 text-xs">
      </div>
    </div>
  );
}
