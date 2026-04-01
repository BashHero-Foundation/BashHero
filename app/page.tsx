import TypingArea from "./typing/page";  

export default function Home() {
  return (
    <div>
      <div className="flex flex-col justify-center items-center p-10 bg-blue-950">
          <h1 className="font-retro text-3xl text-white mb-2">BASH HERO </h1>
          <p className="font-retro text-sm text-neutral-50 tracking-widest"> your way to become a programist</p>
      </div>

      <div>
        <TypingArea></TypingArea>
      </div>
    
    </div>
  );
}
