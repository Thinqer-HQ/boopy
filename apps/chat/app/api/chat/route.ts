import 'server-only'
import { convertToCoreMessages, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { nanoid } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db_types'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase =
    (await createSupabaseServerClient()) as unknown as SupabaseClient<Database>
  const json = await req.json()
  const { messages, previewToken, id } = json as {
    messages: { role: string; content: string }[]
    previewToken?: string
    id?: string
  }

  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const apiKey = previewToken || process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response('Missing OpenAI API key', { status: 500 })
  }

  const openai = createOpenAI({ apiKey })

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    messages: convertToCoreMessages(
      messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ),
    async onFinish({ text }) {
      const title = (messages[0]?.content ?? '').substring(0, 100)
      const chatId = id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${chatId}`
      const payload = {
        id: chatId,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: text,
            role: 'assistant'
          }
        ]
      }
      await supabase
        .from('chats')
        .upsert({ id: chatId, user_id: userId, payload })
        .throwOnError()
    }
  })

  return result.toDataStreamResponse()
}
