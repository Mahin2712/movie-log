export function getWatchStats(watched = []) {
  const now = new Date();

  let allTime = watched.length;
  let thisYear = 0;
  let thisMonth = 0;
  let thisWeek = 0;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  watched.forEach(m => {
    if (!m.dateAdded) return;

    const d = new Date(m.dateAdded);

    if (d.getFullYear() === now.getFullYear()) {
      thisYear++;

      if (d.getMonth() === now.getMonth()) {
        thisMonth++;
      }
    }

    if (d >= startOfWeek) {
      thisWeek++;
    }
  });

  return {
    allTime,
    thisYear,
    thisMonth,
    thisWeek
  };
}
