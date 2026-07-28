// 🎲 Random Dungeon Events

export const DUNGEON_EVENTS = [
  {
    id: "treasure_chest",
    name: "صندوقچه گنج",
    emoji: "🎁",
    desc: "یه صندوقچه مخفی پیدا کردی!",
    type: "reward",
    effect: (player) => {
      const coins = Math.floor(Math.random() * 30) + 10;
      return { coins, message: `🎁 ${coins} سکه پیدا کردی!` };
    },
  },
  {
    id: "healing_spring",
    name: "چشمه شفا",
    emoji: "⛲",
    desc: "یه چشمه جادویی پیدا کردی!",
    type: "heal",
    effect: (player) => {
      const heal = Math.floor(Math.random() * 40) + 20;
      return { heal, message: `⛲ چشمه جادویی ${heal} HP بهت برگردوند!` };
    },
  },
  {
    id: "mysterious_merchant",
    name: "تاجر مرموز",
    emoji: "🧙‍♂️",
    desc: "یه تاجر مرموز ظاهر شد!",
    type: "shop",
    effect: () => {
      return { message: "🧙‍♂️ تاجر یه معجون رایگان بهت داد!", freePotion: true };
    },
  },
  {
    id: "ambush",
    name: "کمین!",
    emoji: "⚠️",
    desc: "غافلگیر شدی!",
    type: "combat",
    effect: (player) => {
      const damage = Math.floor(Math.random() * 15) + 5;
      return { damage, message: `⚠️ از کمین ${damage} HP از دست دادی!` };
    },
  },
  {
    id: "xp_shrine",
    name: "حرم XP",
    emoji: "✨",
    desc: "یه مکان مقدس پیدا کردی!",
    type: "xp",
    effect: () => {
      const xp = Math.floor(Math.random() * 40) + 20;
      return { xp, message: `✨ از حرم مقدس ${xp} XP گرفتی!` };
    },
  },
  {
    id: "word_scroll",
    name: "طومار لغت",
    emoji: "📜",
    desc: "یه طومار باستانی پیدا کردی!",
    type: "knowledge",
    effect: () => {
      const words = ["Ubiquitous = همه‌جاحاضر", "Ephemeral = زودگذر", "Resilient = تاب‌آور", "Eloquent = فصیح", "Pragmatic = عمل‌گرا"];
      const word = words[Math.floor(Math.random() * words.length)];
      return { message: `📜 لغت جدید یاد گرفتی: **${word}**`, xp: 15 };
    },
  },
  {
    id: "nothing",
    name: "مسیر خالی",
    emoji: "🚶",
    desc: "هیچ اتفاقی نیفتاد...",
    type: "none",
    effect: () => {
      return { message: "🚶 مسیر خالی بود. ادامه بده!" };
    },
  },
];

// Get a random event (weighted)
export function getRandomEvent() {
  const weights = [20, 20, 10, 15, 15, 10, 10]; // treasure, spring, merchant, ambush, shrine, scroll, nothing
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < DUNGEON_EVENTS.length; i++) {
    random -= weights[i];
    if (random <= 0) return DUNGEON_EVENTS[i];
  }

  return DUNGEON_EVENTS[0];
}
