"use client"

import { useAuth } from "@/context/auth-context"
import { ChatbotButton } from "./ChatbotButton"
import { ChatbotWindow } from "./ChatbotWindow"
import { useChatbot } from "./useChatbot"

export function ChatbotRoot() {
  const { user, loading } = useAuth()
  const chatbot = useChatbot()

  if (loading || !user) {
    return null
  }

  return (
    <>
      <ChatbotButton isOpen={chatbot.isOpen} onClick={chatbot.toggleChat} />
      {chatbot.isOpen && (
        <ChatbotWindow
          messages={chatbot.messages}
          input={chatbot.input}
          setInput={chatbot.setInput}
          sendMessage={chatbot.sendMessage}
          handleKeyDown={chatbot.handleKeyDown}
          isLoading={chatbot.isLoading}
        />
      )}
    </>
  )
}
