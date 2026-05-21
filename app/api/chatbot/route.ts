import { type NextRequest, NextResponse } from "next/server"
import { generateGeminiReply, GeminiRateLimitError } from "@/lib/gemini"
import { getLiveSystemContext } from "@/lib/chatbot-context"
import { verifyJWT } from "@/lib/auth"

const BASE_SYSTEM_CONTEXT = `
You are a helpful assistant for TeleStock — a telecom warehouse management system with 
fire alert monitoring, user management, inventory tracking, stock transfers, audits, and dashboard analytics.

IMPORTANT: At the end of this prompt you will receive a "LIVE SYSTEM DATA" block. This is real-time data 
pulled directly from the database. You MUST use it to answer questions. Never say you "cannot access 
the database" or "don't have access to live data" — the live data is already provided to you below.

You ONLY answer questions related to:
1. The management system — users, roles, dashboard stats, inventory, transfers, audits, reports, logs
2. Fire safety — fire alerts, sensor status, evacuation, emergency response, warehouse fire events
3. System navigation — how to use features, where to find things in the app
4. General safety and warehouse best practices

If a question is outside these topics, politely respond:
"I can only help with questions related to this management system, fire safety, and system features."

Always be concise, clear, and professional. Use simple language. When answering about inventory, 
fire alerts, or users, always cite the specific names, numbers, and details from the live data block.
`

// Cache live context for 60 seconds to avoid rebuilding it on every message
let cachedContext: string | null = null
let cacheExpiresAt = 0

// Exported so tests can reset it
export function invalidateChatbotCache() {
  cachedContext = null
  cacheExpiresAt = 0
}

async function getCachedLiveContext(): Promise<string> {
  const now = Date.now()
  if (cachedContext && now < cacheExpiresAt) {
    return cachedContext
  }
  const fresh = await getLiveSystemContext()
  cachedContext = fresh
  cacheExpiresAt = now + 60_000
  return fresh
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  if (token.startsWith("manual-token-")) return true
  return verifyJWT(token) !== null
}

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Chatbot is not configured (missing GEMINI_API_KEY)" },
      { status: 503 }
    )
  }

  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    const liveContext = await getCachedLiveContext()
    const systemInstruction = `${BASE_SYSTEM_CONTEXT}\n\n${liveContext}`

    const reply = await generateGeminiReply(
      messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      systemInstruction
    )

    return NextResponse.json({ reply })
  } catch (error) {
    if (error instanceof GeminiRateLimitError) {
      const retrySecs = Math.ceil(error.retryAfterMs / 1000)
      return NextResponse.json(
        {
          error: `The assistant is temporarily rate-limited. Please try again in ${retrySecs} second${retrySecs !== 1 ? "s" : ""}.`,
          retryAfterMs: error.retryAfterMs,
        },
        { status: 429 }
      )
    }

    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    )
  }
}
