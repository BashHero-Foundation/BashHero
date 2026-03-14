export function useKeyboardSchortcuts() {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (e.key == "Tab"){
            e.preventDefault();
            console.log("I prevented TAB :)")
        }
    };

    return { handleKeyDown };

}