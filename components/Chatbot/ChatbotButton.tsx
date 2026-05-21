import { MessageCircle, X } from "lucide-react"

interface ChatbotButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatbotButton({ isOpen, onClick }: ChatbotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close assistant" : "Open assistant"}
      className="fixed bottom-6 right-6 z-[1000] flex h-[52px] w-[52px] items-center justify-center rounded-full border-0 bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
    </button>
  )
}
