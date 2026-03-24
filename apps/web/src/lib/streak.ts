export function calculateStreak(sessions: { startTime: string | Date }[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Extract unique dates with sessions, sorted descending
  const sessionDates = Array.from(
    new Set(
      sessions.map((s) => new Date(s.startTime).toDateString())
    )
  ).map((d) => new Date(d).getTime())
   .sort((a, b) => b - a);

  const today = new Date().toDateString();
  const todayTime = new Date(today).getTime();
  const yesterdayTime = todayTime - 86400000;

  // Check if there was a session today or yesterday
  const latestSessionTime = sessionDates[0];
  if (latestSessionTime < yesterdayTime) return 0;

  let streak = 0;
  let expectedTime = latestSessionTime;

  for (const sessionTime of sessionDates) {
    if (sessionTime === expectedTime) {
      streak++;
      expectedTime -= 86400000; // Look for the previous day
    } else {
      break;
    }
  }

  return streak;
}
