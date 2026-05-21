import { Fragment, type ReactNode } from "react"

interface ChatbotMessageProps {
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean)

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-black/10 px-1 py-0.5 text-[12px]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

function renderAssistantMarkdown(content: string) {
  const lines = content.split("\n")
  const blocks: ReactNode[] = []
  let listItems: ReactNode[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-1 list-disc space-y-1 pl-5">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      return
    }

    if (line.startsWith("### ")) {
      flushList()
      blocks.push(
        <h4 key={idx} className="mt-2 text-[13px] font-semibold">
          {renderInline(line.slice(4))}
        </h4>
      )
      return
    }

    if (line.startsWith("## ")) {
      flushList()
      blocks.push(
        <h3 key={idx} className="mt-2 text-[13px] font-semibold">
          {renderInline(line.slice(3))}
        </h3>
      )
      return
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(<li key={idx}>{renderInline(line.slice(2))}</li>)
      return
    }

    flushList()
    blocks.push(
      <p key={idx} className="my-1">
        {renderInline(line)}
      </p>
    )
  })

  flushList()
  return blocks
}

export function ChatbotMessage({ role, content, isLoading }: ChatbotMessageProps) {
  const isUser = role === "user"

  return (
    <div
      className={`flex mb-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed ${
          isLoading ? "opacity-60" : ""
        } ${
          isUser
            ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-sm bg-muted text-foreground"
        }`}
      >
        {isUser ? content : <div className="space-y-1">{renderAssistantMarkdown(content)}</div>}
      </div>
    </div>
  )
}
