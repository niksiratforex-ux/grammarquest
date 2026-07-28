// 📊 Profile & Leaderboard handlers

import { ensurePlayer, getPlayerData, getTopPlayers, getTopStreaks } from "../data/database.js";
import { formatPlayerStats, progressBar, xpProgress } from "../utils/helpers.js";

export function setupProfileHandlers(bot) {

  // ── /profile — Your stats ─────────────────────────────
  bot.command("profile", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);
    return ctx.reply(formatPlayerStats(player), { parse_mode: "Markdown" });
  });

  // ── /leaderboard — Top players ────────────────────────
  bot.command("leaderboard", (ctx) => {
    const top = getTopPlayers();

    if (top.length === 0) {
      return ctx.reply("📊 هنوز کسی بازی نکرده! اولین نفر باش 🎮");
    }

    const medals = ["🥇", "🥈", "🥉"];
    const rows = top.map((p, i) => {
      const medal = medals[i] || `${i + 1}.`;
      const name = p.first_name || p.username || "ناشناس";
      return `${medal} **${name}** — لول ${p.level} | ⭐${p.xp} XP | 🔥${p.streak}`;
    });

    return ctx.reply(
      `🏆 **لیدربورد**\n\n${rows.join("\n")}\n\n` +
      `💡 امتیاز بیشتر = لول بالاتر`,
      { parse_mode: "Markdown" }
    );
  });

  // ── /streak — Streak leaderboard ──────────────────────
  bot.command("streak", (ctx) => {
    const top = getTopStreaks();

    if (top.length === 0) {
      return ctx.reply("🔥 هنوز کسی استریک نداره! اولین نفر باش 🎮");
    }

    const rows = top.map((p, i) => {
      const name = p.first_name || p.username || "ناشناس";
      return `${i + 1}. **${name}** — 🔥 ${p.streak} برد پشت سر هم`;
    });

    return ctx.reply(
      `🔥 **استریک لیدربورد**\n\n${rows.join("\n")}`,
      { parse_mode: "Markdown" }
    );
  });

  // ── /start — Welcome message ──────────────────────────
  bot.command("start", (ctx) => {
    ensurePlayer(ctx.from.id, ctx.from.username, ctx.from.first_name);
    return ctx.reply(
      `🎮 **به GrammarQuest خوش اومدی!**\n\n` +
      `یه بازی آموزشی انگلیسی با دو بخش اصلی:\n\n` +
      `⚔️ **Vocab Clash** — نبرد لغات 1v1\n` +
      `یاد بگیر و رقابت کن!\n` +
      `/clash easy|medium|hard\n\n` +
      `🧙‍♂️ **Grammar Dungeon** — سیاه‌گرامر RPG\n` +
      `با هیولاها بجنگی، گرامر یاد بگیری!\n` +
      `/dungeon\n\n` +
      `📊 **پروفایل و لیدربورد**\n` +
      `/profile — آمار تو\n` +
      `/leaderboard — بهترین بازیکنا\n` +
      `/streak — استریک لیدربورد\n\n` +
      `💊 /heal — درمان\n\n` +
      `💡 با هر بازی XP و سکه بگیر، لول آپ کن، و گرامر یاد بگیر!\n\n` +
      `شروع کن: /clash یا /dungeon 🚀`,
      { parse_mode: "Markdown" }
    );
  });

  // ── /help — Quick reference ───────────────────────────
  bot.command("help", (ctx) => {
    return ctx.reply(
      `📋 **دستورات GrammarQuest**\n\n` +
      `⚔️ /clash [easy|medium|hard] — نبرد لغات\n` +
      `🧙‍♂️ /dungeon — سیاه‌گرامر\n` +
      `📊 /profile — آمار من\n` +
      `🏆 /leaderboard — لیدربورد\n` +
      `🔥 /streak — استریک لیدربورد\n` +
      `💊 /heal — درمان\n` +
      `❓ /help — این پیام`,
      { parse_mode: "Markdown" }
    );
  });
}
