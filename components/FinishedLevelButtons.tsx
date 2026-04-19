import Link from "next/link";

export default function FinishedLevelButtons({ levelId }: { levelId: string }) {

    // !! it has to be changed in future
    const handleReset = () => {
        console.log("Gra zrestartowana!");
        window.location.reload();
    };


    return (
        <div className="mt-15 flex flex-row w-full max-w-2xl items-center justify-center gap-5 font-bold uppercase tracking-wider">
            
            <button  
            onClick={handleReset}
            className="flex-1 rounded-xl border-b-4 border-gray-600 bg-gray-800 shadow-lg
            p-2 text-3xl text-gray-400 transition hover:bg-red-600 hover:text-white
            active:scale-95 active:border-b-0 active:translate-y-1"> 
            ⟲ 
            </button> 

            <Link href={`/game/${levelId}/stats`} className="flex-4 text-center">
                <button className="w-full rounded-xl border-b-4 border-btn-primary-border bg-btn-primary-bg shadow-lg
                px-6 py-4 text-lg text-btn-primary-text transition hover:bg-btn-primary-bg-hover
                active:border-b-0 active:translate-y-1"> 
                Statystyki  
                </button> 
            </Link> 


            <Link href={`/game/${parseInt(levelId) + 1}`} className="flex-1.5 text-center"> 
            <button 
                className="w-full rounded-xl border-b-4 border-green-800 bg-green-600 shadow-lg
                px-3 py-4 text-lg text-text-primary transition hover:bg-green-500 hover:text-white
                active:scale-95 active:border-b-0 active:translate-y-1"> 
                Kolejny poziom ⮞ 
                </button> 
            </Link> 

        </div>
    )
}