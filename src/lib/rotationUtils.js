export function getDayPhase(date, startDateStr, pattern) {
  if (!startDateStr || !pattern) return null
  const parts = pattern.split('/')
  if (parts.length !== 2) return null
  const onDays = parseInt(parts[0])
  const offDays = parseInt(parts[1])
  if (isNaN(onDays) || isNaN(offDays)) return null

  const totalCycle = onDays + offDays
  const start = new Date(startDateStr + 'T00:00:00')
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const daysSinceStart = Math.floor((d - start) / (1000 * 60 * 60 * 24))
  const dayInCycle = ((daysSinceStart % totalCycle) + totalCycle) % totalCycle
  return dayInCycle < onDays ? 'ON_SHIFT' : 'AT_HOME'
}

export function getRotationStatus(startDateStr, pattern) {
  if (!startDateStr || !pattern) return null
  const parts = pattern.split('/')
  if (parts.length !== 2) return null
  const onDays = parseInt(parts[0])
  const offDays = parseInt(parts[1])
  if (isNaN(onDays) || isNaN(offDays)) return null

  const totalCycle = onDays + offDays
  const start = new Date(startDateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const dayInCycle = ((daysSinceStart % totalCycle) + totalCycle) % totalCycle

  if (dayInCycle < onDays) {
    return {
      phase: 'ON_SHIFT',
      daysRemaining: onDays - dayInCycle,
      dayNumber: dayInCycle + 1,
      totalDays: onDays,
      progressPct: ((dayInCycle + 1) / onDays) * 100,
    }
  } else {
    const homeDay = dayInCycle - onDays
    return {
      phase: 'AT_HOME',
      daysRemaining: totalCycle - dayInCycle,
      dayNumber: homeDay + 1,
      totalDays: offDays,
      progressPct: ((homeDay + 1) / offDays) * 100,
    }
  }
}
