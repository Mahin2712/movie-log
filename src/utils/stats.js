/**
 * Enhanced Watch Stats Utility
 * Calculates advanced metrics for the Insights dashboard.
 */
export function getWatchStats(watched = []) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const stats = {
    allTime: watched.length,
    thisYear: 0,
    thisMonth: 0,
    thisWeek: 0,
    genreDistribution: {},
    activityHeatmap: {}, // { "YYYY-MM-DD": count }
    tvCompletion: {
        total: 0,
        completed: 0,
        percent: 0
    },
    streaks: {
      current: 0,
      best: 0
    },
    momentum: [] // Trending genres in the last 30 days
  };

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentGenreCounts = {};

  watched.forEach(m => {
    if (!m.dateAdded) return;

    const d = new Date(m.dateAdded);
    const dateKey = d.toISOString().split('T')[0];

    // Basic count stats
    if (d.getFullYear() === currentYear) {
      stats.thisYear++;
      if (d.getMonth() === currentMonth) {
        stats.thisMonth++;
      }
    }
    if (d >= startOfWeek) {
      stats.thisWeek++;
    }

    // Heatmap data
    stats.activityHeatmap[dateKey] = (stats.activityHeatmap[dateKey] || 0) + 1;

    // Genre distribution
    if (Array.isArray(m.genre_ids)) {
      m.genre_ids.forEach(gid => {
        stats.genreDistribution[gid] = (stats.genreDistribution[gid] || 0) + 1;
        
        // Track recent genre activity
        if (d >= thirtyDaysAgo) {
          recentGenreCounts[gid] = (recentGenreCounts[gid] || 0) + 1;
        }
      });
    }

    // TV Completion stats
    if (m.media_type === 'tv' || m.id.toString().includes('_tv')) {
        stats.tvCompletion.total++;
        if (m.progress?.percentComplete >= 100) {
            stats.tvCompletion.completed++;
        }
    }
  });

  // Calculate streaks
  const activeDates = Object.keys(stats.activityHeatmap).sort().reverse();
  if (activeDates.length > 0) {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check current streak (must include today or yesterday)
    let streakDate = new Date(now);
    if (!stats.activityHeatmap[todayStr] && !stats.activityHeatmap[yesterdayStr]) {
        currentStreak = 0;
    } else {
        if (!stats.activityHeatmap[todayStr]) streakDate.setDate(now.getDate() - 1);
        
        while (stats.activityHeatmap[streakDate.toISOString().split('T')[0]]) {
            currentStreak++;
            streakDate.setDate(streakDate.getDate() - 1);
        }
    }

    // Calculate best streak
    const allDates = Object.keys(stats.activityHeatmap).sort();
    if (allDates.length > 0) {
        let lastDate = new Date(allDates[0]);
        tempStreak = 1;
        bestStreak = 1;

        for (let i = 1; i < allDates.length; i++) {
            const currDate = new Date(allDates[i]);
            const diffDays = (currDate - lastDate) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            bestStreak = Math.max(bestStreak, tempStreak);
            lastDate = currDate;
        }
    }

    stats.streaks.current = currentStreak;
    stats.streaks.best = bestStreak;
  }

  // Calculate momentum (Top 3 genres in last 30 days)
  stats.momentum = Object.entries(recentGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gid]) => Number(gid));

  // Calculate completion percentage
  if (stats.tvCompletion.total > 0) {
      stats.tvCompletion.percent = Math.round((stats.tvCompletion.completed / stats.tvCompletion.total) * 100);
  }

  return stats;
}

