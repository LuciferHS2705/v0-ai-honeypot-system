import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { generateSystemPrompt, DEFAULT_PERSONA } from "@/lib/persona"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const systemPrompt = generateSystemPrompt(DEFAULT_PERSONA)

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.8,
    maxTokens: 200,
  })

  return result.toUIMessageStreamResponse()
}
