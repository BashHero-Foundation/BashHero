
export default function FinishedLevelButtons({ levelId, nextLevelId, onNavigate }: { levelId: string; nextLevelId: string | null; onNavigate: (href: string) => void }) {

    // !! it has to be changed in future
    const handleReset = () => {
        console.log("Gra zrestartowana!");
        window.location.reload();
    };
    const handleStatsNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(`/game/${levelId}/stats`);
    };
    const handleNextLevelNavigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!nextLevelId) return;
        event.preventDefault();
        onNavigate(`/game/${nextLevelId}`);
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

            <a href={`/game/${levelId}/stats`} onClick={handleStatsNavigate} className="flex-4 text-center">
                <button className="w-full rounded-xl border-b-4 border-btn-primary-border bg-btn-primary-bg shadow-lg
                px-6 py-4 text-lg text-btn-primary-text transition hover:bg-btn-primary-bg-hover
                active:border-b-0 active:translate-y-1"> 
                Statystyki  
                </button> 
            </a> 


            {nextLevelId ? (
                <a href={`/game/${nextLevelId}`} onClick={handleNextLevelNavigate} className="w-full flex-2 rounded-xl border-b-4 border-green-800 bg-green-600 shadow-lg
                px-4 py-4 text-md text-text-primary transition hover:bg-green-500 hover:text-white
                active:border-b-0 active:translate-y-1">
                    Następny poziom
                </a>
            ) : (
                <p className="mt-6 text-gray-500 font-semibold">To byl ostatni poziom</p>
            )}


        </div>
    )
}