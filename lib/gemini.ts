const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

// Only send the last N turns to keep token usage low
const MAX_HISTORY_MESSAGES = 10

export class GeminiRateLimitError extends Error {
  retryAfterMs: number
  constructor(retryAfterMs: number) {
    super(`Gemini rate limit exceeded. Retry after ${Math.ceil(retryAfterMs / 1000)}s.`)
    this.name = "GeminiRateLimitError"
    this.retryAfterMs = retryAfterMs
  }
}

export interface GeminiMessage {
  role: "user" | "assistant"
  content: string
}

interface GeminiContent {
  role: "user" | "model"
  parts: { text: string }[]
}

/**
 * Calls Gemini via REST API (no @google/generative-ai package required).
 * Only the last MAX_HISTORY_MESSAGES are forwarded to keep token usage low.
 * Throws GeminiRateLimitError on 429 so callers can surface a helpful message.
 */
export async function generateGeminiReply(
  messages: GeminiMessage[],
  systemInstruction: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  // Trim history to avoid token bloat on long conversations
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES)

  const contents: GeminiContent[] = trimmed.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }))

  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()

    if (res.status === 429) {
      // Parse the suggested retry delay from the response body
      let retryAfterMs = 30_000 // safe default
      try {
        const errJson = JSON.parse(errBody) as {
          error?: {
            details?: Array<{
              "@type": string
              retryDelay?: string
            }>
          }
        }
        const retryInfo = errJson?.error?.details?.find(
          (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        )
        if (retryInfo?.retryDelay) {
          const secs = parseInt(retryInfo.retryDelay.replace("s", ""), 10)
          if (!isNaN(secs) && secs > 0) retryAfterMs = secs * 1000
        }
      } catch {
        // keep default
      }
      throw new GeminiRateLimitError(retryAfterMs)
    }

    throw new Error(`Gemini API ${res.status}: ${errBody}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Gemini returned an empty response")
  }

  return text
}
