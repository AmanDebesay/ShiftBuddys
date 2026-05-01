// Gregorian Easter algorithm
function easter(Y) {
  const a = Y % 19, b = Math.floor(Y / 100), c = Y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mo = Math.floor((h + l - 7 * m + 114) / 31)
  const dy = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Y, mo - 1, dy)
}

// nth Monday of a month (n=1 is first Monday)
function nthMonday(year, month, n) {
  const d = new Date(year, month, 1)
  const offset = (8 - d.getDay()) % 7
  d.setDate(1 + offset + (n - 1) * 7)
  return d
}

// Last Monday on or before a given day
function mondayOnOrBefore(year, month, day) {
  const d = new Date(year, month, day)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getHolidays(year) {
  const E = easter(year)
  const goodFriday = new Date(E); goodFriday.setDate(E.getDate() - 2)
  const easterMonday = new Date(E); easterMonday.setDate(E.getDate() + 1)

  return [
    { name: "New Year's Day",                    date: fmt(new Date(year, 0, 1)) },
    { name: "Family Day",                        date: fmt(nthMonday(year, 1, 3)) },      // 3rd Mon of Feb
    { name: "Good Friday",                       date: fmt(goodFriday) },
    { name: "Easter Monday",                     date: fmt(easterMonday) },
    { name: "Victoria Day",                      date: fmt(mondayOnOrBefore(year, 4, 24)) }, // Mon on/before May 24
    { name: "Canada Day",                        date: fmt(new Date(year, 6, 1)) },
    { name: "Heritage Day (Alberta)",            date: fmt(nthMonday(year, 7, 1)) },      // 1st Mon of Aug
    { name: "Labour Day",                        date: fmt(nthMonday(year, 8, 1)) },      // 1st Mon of Sep
    { name: "Truth & Reconciliation Day",        date: fmt(new Date(year, 8, 30)) },
    { name: "Thanksgiving",                      date: fmt(nthMonday(year, 9, 2)) },      // 2nd Mon of Oct
    { name: "Remembrance Day",                   date: fmt(new Date(year, 10, 11)) },
    { name: "Christmas Day",                     date: fmt(new Date(year, 11, 25)) },
    { name: "Boxing Day",                        date: fmt(new Date(year, 11, 26)) },
  ]
}
