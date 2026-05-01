export default async function handler(req, res) {
  try {
    const params = new URLSearchParams({
      latitude: '56.7265',
      longitude: '-111.3803',
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'America/Edmonton',
      forecast_days: '7',
      wind_speed_unit: 'kmh',
    })
    const data = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`).then(r => r.json())
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    res.json(data)
  } catch {
    res.status(500).json({ error: 'Weather unavailable' })
  }
}
