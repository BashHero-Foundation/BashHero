export default function TextCorrecter({ text, currentCommand }) {
    const result = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      let className = ""

     if (char === currentCommand.text[i]) {
        className = "text-black-500"
      } else {
        className = "text-red-500 bg-red-100"
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
        <span key="full-text" className="text-gray-400">
          {remaining}
        </span>
      )
    }

    return result
  }