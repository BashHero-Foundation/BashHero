export function useKeyboardShortcuts({handleEnter, handleAutocomplete, handleCtrlA, handleCtrlE}: {handleEnter: () => void, handleAutocomplete: () => void, handleCtrlA: () => void, handleCtrlE: () => void}) {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        
         if (e.key === "Enter"){
            e.preventDefault();
            handleEnter();
            return;
        }

        if (e.ctrlKey && e.key === "v"){
            e.preventDefault();
            console.log("Nie tak łatwo ;)")
        }
        

        if (e.key === "Tab"){
            e.preventDefault();
            handleAutocomplete()
        }


        if (e.ctrlKey && e.key.toLowerCase() === "a") {
            e.preventDefault();
            handleCtrlA();
            return;
        }

        if (e.ctrlKey && e.key.toLowerCase() === "e"){
            e.preventDefault();
            handleCtrlE();
            return;
            
        }


        if (e.ctrlKey && e.key === "d"){
            e.preventDefault();
            console.log("CTRL + d pressed")
        }
        if (e.altKey && e.key === "f"){
            e.preventDefault();
            console.log("ALT + f pressed")
        }

        if (e.key === "ArrowUp"){
            e.preventDefault();
            console.log("Arrow UP")
        }
        if (e.key === "ArrowDown"){
            e.preventDefault();
            console.log("Arrow DOWN")
        }


    };

    return { handleKeyDown };

}