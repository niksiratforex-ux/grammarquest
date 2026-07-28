// ── XP & Leveling ───────────────────────────────────────

export function xpForLevel(level) {
  return (level - 1) * 100;
}

export function levelFromXP(xp) {
  return Math.floor(xp / 100) + 1;
}

export function xpProgress(xp) {
  const level = levelFromXP(xp);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const progress = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { level, progress, needed, percent: Math.round((progress / needed) * 100) };
}

// ── Progress Bar ────────────────────────────────────────

export function progressBar(current, max, length = 10) {
  const filled = Math.round((current / max) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// ── Player Stats Display ───────────────────────────────

export function formatPlayerStats(player) {
  const prog = xpProgress(player.xp);
  const hpBar = progressBar(player.hp, player.max_hp, 8);
  const xpBar = progressBar(prog.progress, prog.needed, 8);

  return [
    `👤 ${player.first_name || player.username || "بازیکن"}`,
    `📊 لول: ${prog.level} | ⭐ XP: ${player.xp}`,
    `📈 پیشرفت: ${xpBar} ${prog.percent}%`,
    `❤️ HP: ${hpBar} ${player.hp}/${player.max_hp}`,
    `⚔️ حمله: ${player.attack} | 🛡️ دفاع: ${player.defense}`,
    `💰 سکه: ${player.coins}`,
    `🏆 برد: ${player.wins} | 💀 باخت: ${player.losses}`,
    `🔥 استریک: ${player.streak} (بهترین: ${player.best_streak})`,
    `🗺️ سیاه‌گرامر: طبقه ${player.dungeon_floor + 1}`,
  ].join("\n");
}

// ── Timer Display ───────────────────────────────────────

export function timeLeftText(seconds) {
  if (seconds <= 0) return "⏰ وقت تموم شد!";
  return `⏱️ ${seconds} ثانیه باقی مانده`;
}

// ── Random helpers ──────────────────────────────────────

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Dungeon helpers ─────────────────────────────────────

export function monsterHPBar(monster) {
  return progressBar(monster.currentHP || monster.hp, monster.hp, 8);
}

export function formatBattleScene(player, monster, playerHP, monsterHP) {
  const pBar = progressBar(playerHP, player.max_hp, 8);
  const mBar = progressBar(monsterHP, monster.hp, 8);
  return [
    `${monster.emoji} ${monster.name}`,
    `❤️ ${mBar} ${monsterHP}/${monster.hp}`,
    "",
    "⚔️ در حال مبارزه...",
    "",
    `🧑 ${player.first_name || "قهرمان"}`,
    `❤️ ${pBar} ${playerHP}/${player.max_hp}`,
  ].join("\n");
}
