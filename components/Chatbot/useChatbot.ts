"use client"

import { useState } from "react"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your TeleStock assistant. Ask me about fire alerts, dashboard stats, users, inventory, or how to use this system.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const toggleChat = () => setIsOpen((prev) => !prev)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: input.trim() }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        let errorContent: string
        if (res.status === 429) {
          errorContent =
            data.error ||
            "The assistant is temporarily rate-limited. Please wait a moment and try again."
        } else if (data.error === "Authentication required") {
          errorContent = "Please sign in again to use the assistant."
        } else {
          errorContent = data.error || "Sorry, I could not get a response."
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorContent },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I could not get a response.",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return {
    isOpen,
    toggleChat,
    messages,
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    isLoading,
  }
}
