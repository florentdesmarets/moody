export const BADGES = [
  // ── Premiers pas ──────────────────────────────────────────────
  { id: 'starter',        emoji: '🌱', labelKey: 'badgeStarter',        descKey: 'badgeStarterDesc' },

  // ── Streak ────────────────────────────────────────────────────
  { id: 'streak3',        emoji: '🔥', labelKey: 'badgeStreak3',        descKey: 'badgeStreak3Desc' },
  { id: 'streak7',        emoji: '⚡', labelKey: 'badgeStreak7',        descKey: 'badgeStreak7Desc' },
  { id: 'streak30',       emoji: '💎', labelKey: 'badgeStreak30',       descKey: 'badgeStreak30Desc' },
  { id: 'streak60',       emoji: '🌙', labelKey: 'badgeStreak60',       descKey: 'badgeStreak60Desc' },
  { id: 'streak100',      emoji: '🌈', labelKey: 'badgeStreak100',      descKey: 'badgeStreak100Desc' },
  { id: 'streak365',      emoji: '🌞', labelKey: 'badgeStreak365',      descKey: 'badgeStreak365Desc' },

  // ── Entrées ───────────────────────────────────────────────────
  { id: 'entries10',      emoji: '🦉', labelKey: 'badgeEntries10',      descKey: 'badgeEntries10Desc' },
  { id: 'entries50',      emoji: '🌟', labelKey: 'badgeEntries50',      descKey: 'badgeEntries50Desc' },
  { id: 'entries100',     emoji: '🏆', labelKey: 'badgeEntries100',     descKey: 'badgeEntries100Desc' },
  { id: 'entries200',     emoji: '📖', labelKey: 'badgeEntries200',     descKey: 'badgeEntries200Desc' },
  { id: 'entries365',     emoji: '🎯', labelKey: 'badgeEntries365',     descKey: 'badgeEntries365Desc' },

  // ── Courage & régularité ──────────────────────────────────────
  { id: 'brave',     emoji: '🫂', labelKey: 'badgeBrave',     descKey: 'badgeBraveDesc' },
  { id: 'thorough',  emoji: '🔍', labelKey: 'badgeThorough',  descKey: 'badgeThoroughDesc' },

  // ── Journal ───────────────────────────────────────────────────
  { id: 'commentator',    emoji: '📝', labelKey: 'badgeCommentator',    descKey: 'badgeCommentatorDesc' },
  { id: 'writer',         emoji: '💌', labelKey: 'badgeWriter',         descKey: 'badgeWriterDesc' },

  // ── Sommeil ───────────────────────────────────────────────────
  { id: 'goodSleeper',    emoji: '😴', labelKey: 'badgeGoodSleeper',    descKey: 'badgeGoodSleeperDesc' },
  { id: 'sleepChamp',     emoji: '🛌', labelKey: 'badgeSleepChamp',     descKey: 'badgeSleepChampDesc' },

  // ── Bien-être ─────────────────────────────────────────────────
  { id: 'balanced',       emoji: '🥗', labelKey: 'badgeBalanced',       descKey: 'badgeBalancedDesc' },
  { id: 'energized',      emoji: '💪', labelKey: 'badgeEnergized',      descKey: 'badgeEnergizedDesc' },
]

export function computeBadges({ streak, count, commentCount, longCommentCount, goodSleepCount, wellFedCount, notTiredCount, hardDaysCount, thoroughCount }) {
  return BADGES.map(b => ({
    ...b,
    unlocked:
      b.id === 'starter'          ? true :
      b.id === 'streak3'          ? streak >= 3 :
      b.id === 'streak7'          ? streak >= 7 :
      b.id === 'streak30'         ? streak >= 30 :
      b.id === 'streak60'         ? streak >= 60 :
      b.id === 'streak100'        ? streak >= 100 :
      b.id === 'streak365'        ? streak >= 365 :
      b.id === 'entries10'        ? count >= 10 :
      b.id === 'entries50'        ? count >= 50 :
      b.id === 'entries100'       ? count >= 100 :
      b.id === 'entries200'       ? count >= 200 :
      b.id === 'entries365'       ? count >= 365 :
      b.id === 'brave'            ? hardDaysCount >= 5 :
      b.id === 'thorough'         ? thoroughCount >= 10 :
      b.id === 'commentator'      ? commentCount >= 20 :
      b.id === 'writer'           ? longCommentCount >= 10 :
      b.id === 'goodSleeper'      ? goodSleepCount >= 15 :
      b.id === 'sleepChamp'       ? goodSleepCount >= 50 :
      b.id === 'balanced'         ? wellFedCount >= 20 :
      b.id === 'energized'        ? notTiredCount >= 20 :
      false,
  }))
}

export function getAvatar(avatarId) {
  return BADGES.find(b => b.id === avatarId)?.emoji ?? '🌱'
}
