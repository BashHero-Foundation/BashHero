import { scormify_path } from "@/app/scorm/scorm_utils";
import { RotateCcw, ArrowBigRightDash } from 'lucide-react';

export default function FinishedLevelButtons({ levelId, nextLevelId }: { levelId: string; nextLevelId: string | null }) {

    // !! it has to be changed in future
    const handleReset = () => {
        console.log("Gra zrestartowana!");
        window.location.reload();
    };


    return (
        <div className="mt-15 flex flex-row w-full max-w-2xl items-center justify-center gap-5 font-bold uppercase tracking-wider">
            
            <button  
            onClick={handleReset}
            aria-label="Reset"
            className="flex flex-1 items-center justify-center rounded-xl border-b-4 border-gray-600 bg-gray-800 shadow-lg
            px2 py-4 text-gray-400 transition hover:bg-red-600 hover:text-white
            active:scale-95 active:border-b-0 active:translate-y-1 active:bg-red-800"> 
                <RotateCcw size={24} strokeWidth={3} />
            </button> 

            <a 
            href={scormify_path(`/game/${levelId}/stats`)}
            className="flex flex-4 items-center justify-center text-center rounded-xl border-b-4 border-btn-primary-border bg-btn-primary-bg shadow-lg
                px-6 py-4 text-lg text-btn-primary-text tracking-wider transition hover:bg-btn-primary-bg-hover
                active:border-b-0 active:translate-y-1">
                Statystyki  
            </a> 


            {nextLevelId ? (
                <a href={scormify_path(`/game/${nextLevelId}`)} className="flex flex-1 items-center justify-center text-center gap-1 
                rounded-xl border-b-4 border-green-800 bg-green-600 shadow-lg py-4 text-lg text-text-primary normal-case transition hover:bg-green-500 hover:text-white
                active:border-b-0 active:translate-y-1">
                    <ArrowBigRightDash size={30} strokeWidth={2} />
                    
                </a>
            ) : (
                <p className="mt-6 text-gray-500 font-semibold">To już ostatni poziom</p>
            )}


        </div>
    )
}