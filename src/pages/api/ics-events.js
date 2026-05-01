// Server-side ICS proxy — avoids CORS, keeps calendar URLs private

// RFC 5545 line unfolding: CRLF + SPACE/TAB = continuation of previous line
function unfold(text) {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
}

function parseICS(text, from, to) {
  const unfolded = unfold(text)
  const events = []
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []

  // Use end-of-day for 'to' so events on the last day of the month aren't dropped
  const fromD = from ? new Date(from + 'T00:00:00') : null
  const toD   = to   ? new Date(to   + 'T23:59:59') : null

  for (const block of blocks) {
    const get = (key) =>
      block.match(new RegExp(`(?:^|\\n)${key}(?:;[^:\\n]*)?:([^\\n]+)`))?.[1]?.trim()

    const rawSummary = get('SUMMARY') || 'Event'
    const summary = rawSummary
      .replace(/\\n/g, ' ')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')

    const dtstart = get('DTSTART')
    const dtend   = get('DTEND')
    if (!dtstart) continue

    const toDateStr = (dt) => {
      if (!dt) return null
      const digits = dt.replace(/\D/g, '')
      if (digits.length < 8) return null
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
    }

    const startStr = toDateStr(dtstart)
    if (!startStr) continue

    const endStr   = toDateStr(dtend)
    const isAllDay = !dtstart.includes('T')

    const startDate = new Date(startStr + 'T00:00:00')
    let endDate = endStr ? new Date(endStr + 'T00:00:00') : new Date(startDate)

    if (isAllDay && endStr && endDate > startDate) {
      // All-day DTEND is exclusive — subtract one day to get the last day
      endDate = new Date(endDate.getTime() - 86400000)
    } else if (!isAllDay) {
      // Timed events: only show on start date
      endDate = new Date(startDate)
    }

    // Emit one entry per day the event spans
    let cur = new Date(startDate)
    while (cur <= endDate) {
      const ds = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
      const d = new Date(ds + 'T12:00:00')
      if ((!fromD || d >= fromD) && (!toD || d <= toD)) {
        events.push({ summary, date: ds })
      }
      cur = new Date(cur.getTime() + 86400000)
      if (cur.getTime() - startDate.getTime() > 366 * 86400000) break // safety cap
    }
  }
  return events
}

export default async function handler(req, res) {
  let { url, from, to } = req.query

  if (!url) return res.status(400).json({ error: 'Missing url' })

  // Convert webcal:// → https:// automatically
  url = url.replace(/^webcal:\/\//i, 'https://')

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return res.status(400).json({ error: 'Invalid URL — must be https://' })
  }

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'ShiftBuddys/1.0 (+https://shiftbuddys.ca)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const text = await resp.text()

    if (!text.includes('BEGIN:VCALENDAR')) {
      throw new Error('Not a valid ICS file')
    }

    const events = parseICS(text, from, to)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    res.json({ events })
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch calendar', detail: e.message })
  }
}
