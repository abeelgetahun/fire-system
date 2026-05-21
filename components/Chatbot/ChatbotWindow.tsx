"use client"

import { useEffect, useRef } from "react"
import { ChatbotMessage } from "./ChatbotMessage"
import type { ChatMessage } from "./useChatbot"
import { Send } from "lucide-react"

interface ChatbotWindowProps {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  sendMessage: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
}

export function ChatbotWindow({
  messages,
  input,
  setInput,
  sendMessage,
  handleKeyDown,
  isLoading,
}: ChatbotWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div className="fixed bottom-[88px] right-6 z-[1000] flex h-[480px] w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      <div className="bg-primary px-4 py-3.5 text-primary-foreground">
        <p className="text-sm font-semibold">System Assistant</p>
        <p className="text-[11px] font-normal opacity-85">
          Ask about alerts, users, inventory, or fire safety
        </p>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <ChatbotMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <ChatbotMessage role="assistant" content="Thinking..." isLoading />
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-border p-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          disabled={isLoading}
          className="flex-1 rounded-full border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}
