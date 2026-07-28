// 🛒 Items & Shop System

export const SHOP_ITEMS = {
  // ── Weapons (increase attack) ─────────────────────────
  weapons: [
    { id: "wooden_sword",  name: "شمشیر چوبی",      emoji: "🗡️",  price: 30,  attack: 3,  desc: "شمشیر ساده برای مبتدی‌ها" },
    { id: "iron_sword",    name: "شمشیر آهنی",       emoji: "⚔️",  price: 80,  attack: 7,  desc: "شمشیر محکم و تیز" },
    { id: "golden_sword",  name: "شمشیر طلایی",      emoji: "✨",  price: 200, attack: 15, desc: "شمشیر افسانه‌ای با قدرت جادویی" },
    { id: "grammar_blade", name: "تیغ گرامر",        emoji: "📖",  price: 350, attack: 25, desc: "هر ضربه = یه درس گرامر!" },
    { id: "vocab_hammer",  name: "پتک لغات",         emoji: "🔨",  price: 500, attack: 40, desc: "پتکی که با لغات ساخته شده" },
  ],

  // ── Armor (increase defense) ──────────────────────────
  armor: [
    { id: "leather_vest",  name: "جلیقه چرمی",       emoji: "🦺",  price: 25,  defense: 3,  desc: "محافظت ساده" },
    { id: "chain_mail",    name: "زنجیر فولادی",      emoji: "🛡️",  price: 70,  defense: 8,  desc: "زنجیر محکم" },
    { id: "grammar_robe",  name: "ردای گرامر",        emoji: "🧙",  price: 180, defense: 16, desc: "ردای جادویی پر از قواعد" },
    { id: "vocab_armor",   name: "زره لغات",          emoji: "💎",  price: 400, defense: 30, desc: "زره‌ای از جنس لغات" },
  ],

  // ── Potions (consumable) ──────────────────────────────
  potions: [
    { id: "small_potion",  name: "معجون کوچک",       emoji: "🧪",  price: 10,  heal: 25,  desc: "+25 HP" },
    { id: "medium_potion", name: "معجون متوسط",       emoji: "🧴",  price: 25,  heal: 60,  desc: "+60 HP" },
    { id: "large_potion",  name: "معجون بزرگ",        emoji: "🫧",  price: 50,  heal: 120, desc: "+120 HP" },
    { id: "full_potion",   name: "معجون کامل",        emoji: "💖",  price: 100, heal: 999, desc: "پر کردن کامل HP" },
  ],

  // ── Special items ─────────────────────────────────────
  special: [
    { id: "lucky_charm",   name: "طلسم شانس",        emoji: "🍀",  price: 150, desc: "شانس ضربه بحرانی +20%", critBonus: 20 },
    { id: "time_crystal",  name: "کریستال زمان",      emoji: "⏳",  price: 120, desc: "+5 ثانیه وقت در کوئیز", timeBonus: 5 },
    { id: "xp_scroll",     name: "طومار XP",          emoji: "📜",  price: 80,  desc: "XP دو برابر در نبرد بعدی", xpBoost: true },
    { id: "shield_scroll", name: "طومار محافظت",      emoji: "🔰",  price: 100, desc: "دفع اولین حمله هیولا", shieldOnce: true },
  ],
};

// Get all items as flat array
export function getAllItems() {
  return Object.values(SHOP_ITEMS).flat();
}

// Find item by id
export function findItem(id) {
  return getAllItems().find(item => item.id === id);
}

// Get shop display
export function getShopDisplay(category) {
  const items = SHOP_ITEMS[category];
  if (!items) return null;
  return items.map(item =>
    `${item.emoji} **${item.name}** — ${item.price} سکه\n   ${item.desc}`
  ).join("\n\n");
}
