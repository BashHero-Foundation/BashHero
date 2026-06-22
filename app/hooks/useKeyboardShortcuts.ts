export function useKeyboardShortcuts({handleEnter}: {handleEnter: () => void}) {

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
            console.log("I prevented TAB :)")
        }
        if (e.ctrlKey && e.key === "e"){
            e.preventDefault();
            console.log("CTRL + e pressed")
        }
        if (e.ctrlKey && e.key === "d"){
            e.preventDefault();
            console.log("CTRL + d pressed")
        }
        if (e.altKey && e.key === "f"){
            e.preventDefault();
            console.log("ALT + f pressed")
        }
    };

    return { handleKeyDown };

}