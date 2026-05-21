const GEMINI_MODEL = "gemini-2.0-flash"
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

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
 */
export async function generateGeminiReply(
  messages: GeminiMessage[],
  systemInstruction: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const contents: GeminiContent[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }))

  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
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
