// 🏅 Achievements System

export const ACHIEVEMENTS = [
  // ── Battle achievements ───────────────────────────────
  { id: "first_battle",    name: "اولین نبرد",        emoji: "⚔️",  desc: "اولین نبرد لغات رو انجام بده",            check: (p) => p.wins + p.losses >= 1 },
  { id: "win_5",           name: "جنگجو",             emoji: "🗡️",  desc: "۵ برد در نبرد لغات",                      check: (p) => p.wins >= 5 },
  { id: "win_20",          name: "قهرمان",            emoji: "🏆",  desc: "۲۰ برد در نبرد لغات",                     check: (p) => p.wins >= 20 },
  { id: "win_50",          name: "افسانه",            emoji: "👑",  desc: "۵۰ برد در نبرد لغات",                     check: (p) => p.wins >= 50 },
  { id: "streak_3",        name: "هت‌تریک",           emoji: "🔥",  desc: "۳ برد پشت سر هم",                        check: (p) => p.best_streak >= 3 },
  { id: "streak_10",       name: "شکست‌ناپذیر",       emoji: "💫",  desc: "۱۰ برد پشت سر هم",                       check: (p) => p.best_streak >= 10 },

  // ── Dungeon achievements ──────────────────────────────
  { id: "first_monster",   name: "شکارچی",            emoji: "🎯",  desc: "اولین هیولا رو شکست بده",                 check: (p) => p.dungeon_floor >= 1 || p.dungeon_room >= 1 },
  { id: "floor_2",         name: "غارنورد",           emoji: "🦇",  desc: "به طبقه دوم سیاه‌گرامر برس",              check: (p) => p.dungeon_floor >= 2 },
  { id: "floor_3",         name: "قلعه‌گشا",          emoji: "🏰",  desc: "به طبقه سوم سیاه‌گرامر برس",              check: (p) => p.dungeon_floor >= 3 },
  { id: "floor_5",         name: "فتح‌کننده",          emoji: "🌋",  desc: "تمام سیاه‌گرامر رو فتح کن",               check: (p) => p.dungeon_floor >= 5 },

  // ── Level achievements ────────────────────────────────
  { id: "level_5",         name: "مبتدی",             emoji: "🌱",  desc: "به لول ۵ برس",                            check: (p) => Math.floor(p.xp / 100) + 1 >= 5 },
  { id: "level_10",        name: "با تجربه",          emoji: "🌿",  desc: "به لول ۱۰ برس",                           check: (p) => Math.floor(p.xp / 100) + 1 >= 10 },
  { id: "level_25",        name: "استاد",             emoji: "🌳",  desc: "به لول ۲۵ برس",                           check: (p) => Math.floor(p.xp / 100) + 1 >= 25 },

  // ── Economy achievements ──────────────────────────────
  { id: "coins_100",       name: "پس‌انداز",          emoji: "💰",  desc: "۱۰۰ سکه جمع کن",                          check: (p) => p.coins >= 100 },
  { id: "coins_500",       name: "ثروتمند",           emoji: "💎",  desc: "۵۰۰ سکه جمع کن",                          check: (p) => p.coins >= 500 },
  { id: "coins_1000",      name: "میلیونر",           emoji: "🏦",  desc: "۱۰۰۰ سکه جمع کن",                         check: (p) => p.coins >= 1000 },
];

// Check which achievements a player has earned
export function checkAchievements(player, existingIds = []) {
  const newAchievements = [];
  for (const ach of ACHIEVEMENTS) {
    if (!existingIds.includes(ach.id) && ach.check(player)) {
      newAchievements.push(ach);
    }
  }
  return newAchievements;
}

// Get display for earned achievements
export function formatAchievements(earnedIds) {
  if (earnedIds.length === 0) return "هنوز اچیومنتی نداری! شروع کن 🎮";

  return ACHIEVEMENTS
    .filter(a => earnedIds.includes(a.id))
    .map(a => `${a.emoji} **${a.name}** — ${a.desc}`)
    .join("\n");
}
