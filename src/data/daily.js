// 📅 Daily Challenge System

import { WORD_BANK, getShuffledOptions } from "./words.js";
import { GRAMMAR_QUESTIONS, getRandomQuestion } from "./dungeon.js";

// Daily challenges rotate each day
const CHALLENGE_TYPES = [
  {
    id: "vocab_sprint",
    name: "دوی لغات",
    emoji: "🏃",
    desc: "در ۶۰ ثانیه ۱۰ لغت رو درست جواب بده!",
    reward: { xp: 100, coins: 50 },
    target: 10,
    timeLimit: 60,
  },
  {
    id: "grammar_marathon",
    name: "ماراتن گرامر",
    emoji: "📚",
    desc: "بدون غلط ۵ سوال گرامری حل کن!",
    reward: { xp: 80, coins: 40 },
    target: 5,
    noMistakes: true,
  },
  {
    id: "hard_mode",
    name: "حالت سخت",
    emoji: "💀",
    desc: "۳ لغت سخت رو بدون اشتباه جواب بده!",
    reward: { xp: 120, coins: 60 },
    target: 3,
    difficulty: "hard",
  },
  {
    id: "speed_demon",
    name: "شیطان سرعت",
    emoji: "⚡",
    desc: "۵ لغت رو هر کدوم زیر ۵ ثانیه جواب بده!",
    reward: { xp: 90, coins: 45 },
    target: 5,
    maxTime: 5000,
  },
  {
    id: "perfect_round",
    name: "دور کامل",
    emoji: "💯",
    desc: "یه نبرد لغات ۵ دوری رو با امتیاز کامل ببر!",
    reward: { xp: 150, coins: 75 },
    target: 1,
    perfectWin: true,
  },
];

// Get today's challenge based on date
export function getDailyChallenge() {
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % CHALLENGE_TYPES.length;
  return CHALLENGE_TYPES[dayIndex];
}

// Format daily challenge display
export function formatDailyChallenge(challenge, progress = 0) {
  const bar = "█".repeat(Math.min(progress, challenge.target)) + "░".repeat(Math.max(0, challenge.target - progress));
  const completed = progress >= challenge.target;

  return [
    `📅 **چالش روزانه**\n`,
    `${challenge.emoji} **${challenge.name}**`,
    `${challenge.desc}\n`,
    `📊 پیشرفت: ${bar} ${progress}/${challenge.target}`,
    completed
      ? `\n✅ **تکمیل شد!** 🎉 +${challenge.reward.xp} XP | +${challenge.reward.coins} سکه`
      : `\n🎁 پاداش: +${challenge.reward.xp} XP | +${challenge.reward.coins} سکه`,
  ].join("\n");
}
