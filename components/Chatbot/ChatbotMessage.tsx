interface ChatbotMessageProps {
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
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
        {content}
      </div>
    </div>
  )
}
