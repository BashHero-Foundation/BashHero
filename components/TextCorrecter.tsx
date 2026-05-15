export default function TextCorrecter({ text, currentCommand }: { text: string; currentCommand: { text: string } }) {
    const result = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      let className = ""

     if (char === currentCommand.text[i]) {
        className = "text-terminal-main-text"
      } else {
        className = "text-terminal-wrong bg-terminal-wrong-bg"
      }

      result.push(
        <span key={`character-${i}`} className={className}>
          {char}
        </span>
      )
    }

    const remaining = currentCommand.text.slice(text.length)
    if (remaining) {
      result.push(
        <span key="full-text" className="text-terminal-ghost-text">
          {remaining}
        </span>
      )
    }

    return result
  }