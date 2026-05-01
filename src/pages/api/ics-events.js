// Server-side ICS proxy — avoids CORS, keeps calendar URLs private
function parseICS(text, from, to) {
  const events = []
  const blocks = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []
  const fromD = from ? new Date(from) : null
  const toD = to ? new Date(to) : null

  for (const block of blocks) {
    const get = (key) =>
      block.match(new RegExp(`(?:^|\\r?\\n)${key}(?:;[^:\\r\\n]*)?:([^\\r\\n]+)`))?.[1]?.trim()

    const summary = (get('SUMMARY') || 'Event')
      .replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\\\/g, '\\')

    const dtstart = get('DTSTART')
    if (!dtstart) continue

    const digits = dtstart.replace(/\D/g, '')
    if (digits.length < 8) continue
    const dateStr = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`

    const d = new Date(dateStr + 'T12:00:00')
    if (isNaN(d.getTime())) continue
    if (fromD && d < fromD) continue
    if (toD && d > toD) continue

    events.push({ summary, date: dateStr })
  }
  return events
}

export default async function handler(req, res) {
  const { url, from, to } = req.query

  if (!url || !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL — must be https://' })
  }

  try {
    const text = await fetch(url, {
      headers: { 'User-Agent': 'ShiftBuddys/1.0 (+https://shiftbuddys.ca)' },
      signal: AbortSignal.timeout(8000),
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.text()
    })

    const events = parseICS(text, from, to)
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=300')
    res.json({ events })
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch calendar', detail: e.message })
  }
}
