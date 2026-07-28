// 📊 Profile, Leaderboard, Daily & Achievement handlers

import { ensurePlayer, getPlayerData, getTopPlayers, getTopStreaks, getTopMonsters, getEarnedAchievements, earnAchievement, updateDailyProgress, completeDaily, resetDaily } from "../data/database.js";
import { formatPlayerStats, progressBar, xpProgress } from "../utils/helpers.js";
import { checkAchievements, formatAchievements, ACHIEVEMENTS } from "../data/achievements.js";
import { getDailyChallenge, formatDailyChallenge } from "../data/daily.js";
import { findItem } from "../data/items.js";

export function setupProfileHandlers(bot) {

  // ── /profile — Your stats ─────────────────────────────
  bot.command("profile", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);
    const prog = xpProgress(player.xp);
    const hpBar = progressBar(player.hp, player.max_hp, 8);

    // Equipped items
    const weapon = player.equipped_weapon ? findItem(player.equipped_weapon) : null;
    const armor = player.equipped_armor ? findItem(player.equipped_armor) : null;

    const lines = [
      `👤 **${player.first_name || player.username || "بازیکن"}**`,
      `📊 لول: ${prog.level} | ⭐ XP: ${player.xp}`,
      `📈 پیشرفت: ${progressBar(prog.progress, prog.needed, 8)} ${prog.percent}%`,
      `❤️ HP: ${hpBar} ${player.hp}/${player.max_hp}`,
      `⚔️ حمله: ${player.attack} ${weapon ? `(${weapon.emoji} +${weapon.attack})` : ""}`,
      `🛡️ دفاع: ${player.defense} ${armor ? `(${armor.emoji} +${armor.defense})` : ""}`,
      `🎯 ضربه بحرانی: ${player.crit_chance}%`,
      `💰 سکه: ${player.coins}`,
      `🏆 برد: ${player.wins} | 💀 باخت: ${player.losses}`,
      `🔥 استریک: ${player.streak} (بهترین: ${player.best_streak})`,
      `👾 هیولا کشته: ${player.monsters_killed}`,
      `🗺️ سیاه‌گرامر: طبقه ${player.dungeon_floor + 1}`,
    ];

    return ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  });

  // ── /daily — Daily challenge ──────────────────────────
  bot.command("daily", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);
    const challenge = getDailyChallenge();
    const today = new Date().toISOString().split("T")[0];

    // Reset if new day
    if (player.last_daily_date !== today) {
      resetDaily(userId, challenge.id, today);
    }

    const updatedPlayer = getPlayerData(userId);
    const completed = updatedPlayer.daily_completed === 1;

    return ctx.reply(
      formatDailyChallenge(challenge, updatedPlayer.daily_progress) +
      (completed ? "\n\n🕐 فردا چالش جدید میاد!" : ""),
      {
        parse_mode: "Markdown",
        reply_markup: completed ? undefined : {
          inline_keyboard: [
            [{ text: "⚔️ شروع چالش!", callback_data: "daily_start" }],
          ],
        },
      }
    );
  });

  // ── /achievements — View achievements ─────────────────
  bot.command("achievements", (ctx) => {
    const userId = ctx.from.id;
    ensurePlayer(userId, ctx.from.username, ctx.from.first_name);
    const earned = getEarnedAchievements(userId);

    // Check for new achievements
    const player = getPlayerData(userId);
    const newOnes = checkAchievements(player, earned);

    let newMsg = "";
    if (newOnes.length > 0) {
      for (const ach of newOnes) {
        earnAchievement(userId, ach.id);
      }
      newMsg = "\n\n🎉 **اچیومنت جدید!**\n" + newOnes.map(a => `${a.emoji} ${a.name}`).join("\n");
    }

    const allEarned = [...earned, ...newOnes.map(a => a.id)];

    return ctx.reply(
      `🏅 **اچیومنت‌ها** (${allEarned.length}/${ACHIEVEMENTS.length})\n\n` +
      formatAchievements(allEarned) + newMsg,
      { parse_mode: "Markdown" }
    );
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
      return `${medal} **${name}** — لول ${Math.floor(p.xp / 100) + 1} | ⭐${p.xp} | 🔥${p.streak}`;
    });

    return ctx.reply(
      `🏆 **لیدربورد XP**\n\n${rows.join("\n")}`,
      { parse_mode: "Markdown" }
    );
  });

  // ── /streak — Streak leaderboard ──────────────────────
  bot.command("streak", (ctx) => {
    const top = getTopStreaks();
    if (top.length === 0) {
      return ctx.reply("🔥 هنوز کسی استریک نداره!");
    }
    const rows = top.map((p, i) => {
      const name = p.first_name || p.username || "ناشناس";
      return `${i + 1}. **${name}** — 🔥 ${p.streak} برد پشت سر هم`;
    });
    return ctx.reply(`🔥 **استریک لیدربورد**\n\n${rows.join("\n")}`, { parse_mode: "Markdown" });
  });

  // ── /monsters — Monster kill leaderboard ──────────────
  bot.command("monsters", (ctx) => {
    const top = getTopMonsters();
    if (top.length === 0) {
      return ctx.reply("👾 هنوز کسی هیولا نکشته!");
    }
    const rows = top.map((p, i) => {
      const name = p.first_name || p.username || "ناشناس";
      return `${i + 1}. **${name}** — 👾 ${p.monsters_killed} هیولا`;
    });
    return ctx.reply(`👾 **شکارچیان هیولا**\n\n${rows.join("\n")}`, { parse_mode: "Markdown" });
  });

  // ── /start — Welcome ──────────────────────────────────
  bot.command("start", (ctx) => {
    ensurePlayer(ctx.from.id, ctx.from.username, ctx.from.first_name);
    return ctx.reply(
      `🎮 **به GrammarQuest خوش اومدی!**\n\n` +
      `یه بازی آموزشی انگلیسی با دو بخش اصلی:\n\n` +
      `⚔️ **Vocab Clash** — نبرد لغات 1v1\n` +
      `/clash easy|medium|hard\n\n` +
      `🧙‍♂️ **Grammar Dungeon** — سیاه‌گرامر RPG\n` +
      `/dungeon\n\n` +
      `🛒 **فروشگاه آیتم**\n` +
      `/shop\n\n` +
      `📊 **پروفایل و لیدربورد**\n` +
      `/profile — آمار تو\n` +
      `/daily — چالش روزانه\n` +
      `/achievements — اچیومنت‌ها\n` +
      `/leaderboard — بهترین بازیکنا\n` +
      `/streak — استریک لیدربورد\n` +
      `/monsters — شکارچیان هیولا\n\n` +
      `💊 /heal — درمان\n` +
      `🎒 /inventory — کوله‌پشتی\n\n` +
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
      `🛒 /shop — فروشگاه\n` +
      `🎒 /inventory — کوله‌پشتی\n` +
      `📊 /profile — آمار من\n` +
      `📅 /daily — چالش روزانه\n` +
      `🏅 /achievements — اچیومنت‌ها\n` +
      `🏆 /leaderboard — لیدربورد XP\n` +
      `🔥 /streak — استریک\n` +
      `👾 /monsters — شکارچیان\n` +
      `💊 /heal — درمان\n` +
      `❓ /help — این پیام`,
      { parse_mode: "Markdown" }
    );
  });
}
