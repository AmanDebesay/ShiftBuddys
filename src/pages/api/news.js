// Server-side RSS proxy — avoids CORS, aggregates Fort McMurray local news
const FEEDS = [
  { name: 'Fort McMurray Today',       url: 'https://www.fortmcmurraytoday.com/feed/' },
  { name: 'MyMcMurray (Mix 103.7)',    url: 'https://mymcmurray.com/feed/' },
  { name: 'CBC Northern Alberta',      url: 'https://www.cbc.ca/cmlink/rss-canada-edmonton' },
  { name: 'RMWB — Wood Buffalo',       url: 'https://www.rmwb.ca/en/news.xml' },
  { name: 'Alberta Gov News',          url: 'https://www.alberta.ca/news.cfm?rss=true' },
  { name: '🚨 Alberta Alerts',        url: 'https://www.alertable.ca/en/rss/AB' },
]

function parseRSS(xml) {
  const items = []
  const regex = /<item[^>]*>([\s\S]*?)<\/item>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    const item = match[1]
    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
      ?.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'")
      .replace(/&#8230;/g, '…').replace(/&#8211;/g, '–').replace(/<[^>]+>/g, '').trim()
    const link = item.match(/<link>(https?:\/\/[^<\s]+)<\/link>/)?.[1]?.trim()
      || item.match(/<link[^>]+href="(https?:\/\/[^"]+)"/)?.[1]?.trim()
      || item.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1]?.trim()
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()
    if (title && link) items.push({ title, link, pubDate })
    if (items.length >= 6) break
  }
  return items
}

export default async function handler(req, res) {
  const results = await Promise.allSettled(
    FEEDS.map(async feed => {
      const xml = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 ShiftBuddys/1.0 (+https://shiftbuddys.ca)' },
        signal: AbortSignal.timeout(6000),
      }).then(r => r.text())
      const items = parseRSS(xml)
      return { name: feed.name, items }
    })
  )

  const feeds = results
    .filter(r => r.status === 'fulfilled' && r.value.items.length > 0)
    .map(r => r.value)

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120')
  res.json({ feeds })
}
