import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, context } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' })

  const systemPrompt = `You are ShiftBuddy, a helpful AI assistant built specifically for oilsands rotation workers in Fort McMurray, Alberta.

You know about the user's situation:
${context?.name ? `- Name: ${context.name}` : ''}
${context?.rotation_pattern ? `- Rotation: ${context.rotation_pattern} (${context.rotation_pattern.split('/')[0]} days on, ${context.rotation_pattern.split('/')[1]} days off)` : ''}
${context?.phase ? `- Current phase: ${context.phase === 'ON_SHIFT' ? 'ON SHIFT' : 'AT HOME'}` : ''}
${context?.daysRemaining != null ? `- Days remaining in current phase: ${context.daysRemaining}` : ''}
${context?.dayNumber != null ? `- Currently on day ${context.dayNumber} of ${context.totalDays}` : ''}

You can help with:
- Rotation schedule math (when do I go home? when do holidays fall on my days off?)
- Fort McMurray info (weather, roads, camps, local area)
- Alberta workplace info (WCB, employment standards, overtime rules)
- Oilsands life tips (packing, camp food, staying connected with family, mental health)
- RRSP/TFSA basics for shift workers
- Coming home reintegration tips
- Wellbeing and mental health resources

Be concise, direct, and practical. Speak like a knowledgeable friend, not a formal assistant. Use Canadian spelling. Keep answers short unless the user asks for detail. Never give specific legal, medical, or financial advice — point to professionals for those.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    res.json({ content: response.content[0].text })
  } catch (err) {
    console.error('AI chat error:', err)
    res.status(500).json({ error: 'AI unavailable right now.' })
  }
}
