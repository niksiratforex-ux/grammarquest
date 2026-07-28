// 🧙‍♂️ Grammar Dungeon — RPG Grammar Challenges

import { DUNGEON_FLOORS, getRandomQuestion, getRandomMonster, getBoss } from "../data/dungeon.js";
import {
  ensurePlayer, getPlayerData, addXP, addCoins,
  updateDungeonProgress, setPlayerHP,
} from "../data/database.js";
import { progressBar, xpProgress } from "../utils/helpers.js";

// Active dungeon battles by userId
const activeBattles = new Map();

export function setupDungeonHandlers(bot) {

  // ── /dungeon — Enter or view dungeon ──────────────────
  bot.command("dungeon", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);
    const floor = player.dungeon_floor;

    if (floor >= DUNGEON_FLOORS.length) {
      return ctx.reply(
        "🏆 **تو قبلاً تمام سیاه‌گرامر رو فتح کردی!**\n\n" +
        "منتظر آپدیت‌های جدید باش 😎",
        { parse_mode: "Markdown" }
      );
    }

    const currentFloor = DUNGEON_FLOORS[floor];
    const hpBar = progressBar(player.hp, player.max_hp, 8);
    const prog = xpProgress(player.xp);

    return ctx.reply(
      `🗺️ **سیاه‌گرامر — طبقه ${currentFloor.id}**\n` +
      `${currentFloor.emoji} ${currentFloor.name}\n\n` +
      `${currentFloor.description}\n\n` +
      `🧑 **${ctx.from.first_name}** | لول ${prog.level}\n` +
      `❤️ ${hpBar} ${player.hp}/${player.max_hp}\n` +
      `⚔️ حمله: ${player.attack} | 🛡️ دفاع: ${player.defense}\n` +
      `💰 سکه: ${player.coins}\n\n` +
      `🏠 اتاق ${player.dungeon_room + 1}/3 — هر اتاق یه هیولا داره\n` +
      `👑 اتاق آخر = باس‌فایت!\n\n` +
      `کجا می‌خوای بری؟`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚔️ وارد اتاق بعدی شو", callback_data: "dg_enter" }],
            [
              { text: "🧪 خرید معجون (+30 HP) — 15 سکه", callback_data: "dg_potion" },
            ],
            [
              { text: "🗡️ ارتقا حمله (+3) — 20 سکه", callback_data: "dg_upgrade_atk" },
              { text: "🛡️ ارتقا دفاع (+2) — 20 سکه", callback_data: "dg_upgrade_def" },
            ],
            [{ text: "📊 آمار من", callback_data: "dg_stats" }],
          ],
        },
      }
    );
  });

  // ── Callback handler ──────────────────────────────────
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    if (!data.startsWith("dg_")) return;

    const player = getPlayerData(userId);
    if (!player) {
      return ctx.answerCbQuery("❌ اول /dungeon رو بزن!");
    }

    // ── Stats ───────────────────────────────────────────
    if (data === "dg_stats") {
      const prog = xpProgress(player.xp);
      const hpBar = progressBar(player.hp, player.max_hp, 8);
      await ctx.answerCbQuery();
      return ctx.reply(
        `📊 **آمار ${ctx.from.first_name}**\n\n` +
        `📊 لول: ${prog.level}\n` +
        `❤️ HP: ${hpBar} ${player.hp}/${player.max_hp}\n` +
        `⚔️ حمله: ${player.attack}\n` +
        `🛡️ دفاع: ${player.defense}\n` +
        `💰 سکه: ${player.coins}\n` +
        `🗺️ طبقه: ${player.dungeon_floor + 1}\n` +
        `🏆 برد/باخت: ${player.wins}/${player.losses}`,
        { parse_mode: "Markdown" }
      );
    }

    // ── Buy potion ──────────────────────────────────────
    if (data === "dg_potion") {
      if (player.coins < 15) {
        return ctx.answerCbQuery("💰 سکه‌ات کافی نیست! (15 سکه لازمه)");
      }
      if (player.hp >= player.max_hp) {
        return ctx.answerCbQuery("❤️ HP‌ات پره! نیازی به معجون نیست.");
      }
      addCoins(userId, -15);
      const newHP = Math.min(player.hp + 30, player.max_hp);
      setPlayerHP(userId, newHP);
      await ctx.answerCbQuery("🧪 معجون خریدی! +30 HP");
      return ctx.reply(`🧪 **معجون خریدی!** ❤️ HP: ${player.hp} → ${newHP}`, { parse_mode: "Markdown" });
    }

    // ── Upgrade attack ──────────────────────────────────
    if (data === "dg_upgrade_atk") {
      if (player.coins < 20) {
        return ctx.answerCbQuery("💰 سکه‌ات کافی نیست! (20 سکه لازمه)");
      }
      addCoins(userId, -20);
      const { setPlayerAttack } = await import("../data/database.js");
      setPlayerAttack(userId, player.attack + 3);
      await ctx.answerCbQuery("🗡️ حمله ارتقا یافت! +3");
      return ctx.reply(`🗡️ **حمله ارتقا یافت!** ⚔️ ${player.attack} → ${player.attack + 3}`, { parse_mode: "Markdown" });
    }

    // ── Upgrade defense ─────────────────────────────────
    if (data === "dg_upgrade_def") {
      if (player.coins < 20) {
        return ctx.answerCbQuery("💰 سکه‌ات کافی نیست! (20 سکه لازمه)");
      }
      addCoins(userId, -20);
      const { db } = await import("../data/database.js");
      db.prepare("UPDATE players SET defense = defense + 2 WHERE user_id = ?").run(userId);
      await ctx.answerCbQuery("🛡️ دفاع ارتقا یافت! +2");
      return ctx.reply(`🛡️ **دفاع ارتقا یافت!** 🛡️ ${player.defense} → ${player.defense + 2}`, { parse_mode: "Markdown" });
    }

    // ── Enter room ──────────────────────────────────────
    if (data === "dg_enter") {
      if (player.hp <= 0) {
        return ctx.answerCbQuery("💀 مردی! اول /heal بزن یا معجون بخر.");
      }

      const floorIdx = player.dungeon_floor;
      const room = player.dungeon_room;

      if (floorIdx >= DUNGEON_FLOORS.length) {
        return ctx.answerCbQuery("🏆 تمام سیاه‌گرامر رو فتح کردی!");
      }

      const floor = DUNGEON_FLOORS[floorIdx];
      const isBoss = room >= 2; // rooms 0,1 = normal, room 2 = boss
      const monster = isBoss ? getBoss(floorIdx) : getRandomMonster(floorIdx);

      if (!monster) {
        return ctx.answerCbQuery("❌ هیولایی پیدا نشد!");
      }

      const topic = floor.grammarTopics[Math.floor(Math.random() * floor.grammarTopics.length)];

      activeBattles.set(userId, {
        monster: { ...monster, currentHP: monster.hp },
        floorIdx,
        room,
        topic,
        turn: 0,
      });

      await ctx.answerCbQuery(`⚔️ ${monster.emoji} ${monster.name} ظاهر شد!`);

      return ctx.reply(
        `${isBoss ? "👑 **باس‌فایت!**" : "⚔️ **مبارزه!**"}\n\n` +
        `${monster.emoji} **${monster.name}**\n` +
        `❤️ HP: ${monster.hp}/${monster.hp}\n` +
        `⚔️ حمله: ${monster.attack}\n\n` +
        `🗺️ ${floor.emoji} ${floor.name} — اتاق ${room + 1}\n\n` +
        `برای حمله باید سوال گرامری حل کنی!`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚔️ حمله!", callback_data: "dg_attack" }],
              [{ text: "🏃 فرار", callback_data: "dg_flee" }],
            ],
          },
        }
      );
    }

    // ── Attack (grammar question) ───────────────────────
    if (data === "dg_attack") {
      const battle = activeBattles.get(userId);
      if (!battle) return ctx.answerCbQuery("❌ مبارزه‌ای فعال نیست!");

      const question = getRandomQuestion(battle.topic);
      if (!question) return ctx.answerCbQuery("❌ سوالی پیدا نشد!");

      battle.currentQuestion = question;
      battle.turn++;

      const emojis = ["🇦", "🇧", "🇨", "🇩"];
      const keyboard = question.options.map((opt, i) => [
        { text: `${emojis[i]} ${opt}`, callback_data: `dg_ans_${i}` },
      ]);

      return ctx.reply(
        `⚔️ **حمله!** (نوبت ${battle.turn})\n\n` +
        `❓ ${question.q}\n\n` +
        `اگه درست جواب بدی، ${Math.max(5, player.attack - Math.floor(Math.random() * 5))} آسیب می‌زنی!\n` +
        `اگه غلط بدی، هیولا ${monster.attack} آسیب می‌زنه!`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } }
      );
    }

    // ── Answer handler ──────────────────────────────────
    if (data.startsWith("dg_ans_")) {
      const battle = activeBattles.get(userId);
      if (!battle || !battle.currentQuestion) {
        return ctx.answerCbQuery("❌ مبارزه‌ای فعال نیست!");
      }

      const answerIdx = parseInt(data.split("_")[2]);
      const selected = battle.currentQuestion.options[answerIdx];
      const isCorrect = selected === battle.currentQuestion.answer;

      const freshPlayer = getPlayerData(userId);
      let damage;
      let resultText;

      if (isCorrect) {
        // Player attacks monster
        const variance = Math.floor(Math.random() * 5);
        damage = Math.max(5, freshPlayer.attack - variance);
        battle.monster.currentHP = Math.max(0, battle.monster.currentHP - damage);
        resultText = `✅ **درست!** 💥 ${damage} آسیب به ${battle.monster.name}!`;
      } else {
        // Monster attacks player
        damage = Math.max(3, battle.monster.attack - Math.floor(freshPlayer.defense / 3));
        const newHP = Math.max(0, freshPlayer.hp - damage);
        setPlayerHP(userId, newHP);
        resultText = `❌ **غلط!** جواب درست: **${battle.currentQuestion.answer}**\n` +
          `💥 ${battle.monster.emoji} ${battle.monster.name} ${damage} آسیب بهت زد!`;
      }

      await ctx.answerCbQuery(isCorrect ? `✅ درست! 💥${damage}` : `❌ غلط! 💥${damage}`);

      // Check monster dead
      if (battle.monster.currentHP <= 0) {
        activeBattles.delete(userId);
        return monsterDefeated(ctx, userId, battle, freshPlayer);
      }

      // Check player dead
      const updatedPlayer = getPlayerData(userId);
      if (updatedPlayer.hp <= 0) {
        activeBattles.delete(userId);
        return playerDefeated(ctx, userId, battle);
      }

      // Continue battle
      const mBar = progressBar(battle.monster.currentHP, battle.monster.hp, 8);
      const pBar = progressBar(updatedPlayer.hp, updatedPlayer.max_hp, 8);

      return ctx.reply(
        `${resultText}\n\n` +
        `${battle.monster.emoji} **${battle.monster.name}**\n` +
        `❤️ ${mBar} ${battle.monster.currentHP}/${battle.monster.hp}\n\n` +
        `🧑 ${ctx.from.first_name}\n` +
        `❤️ ${pBar} ${updatedPlayer.hp}/${updatedPlayer.max_hp}`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚔️ حمله!", callback_data: "dg_attack" }],
              [{ text: "🏃 فرار", callback_data: "dg_flee" }],
            ],
          },
        }
      );
    }

    // ── Flee ────────────────────────────────────────────
    if (data === "dg_flee") {
      const battle = activeBattles.get(userId);
      if (!battle) return ctx.answerCbQuery("❌ مبارزه‌ای فعال نیست!");

      activeBattles.delete(userId);

      // Lose some HP when fleeing
      const penalty = Math.floor(Math.random() * 10) + 5;
      const freshPlayer = getPlayerData(userId);
      const newHP = Math.max(1, freshPlayer.hp - penalty);
      setPlayerHP(userId, newHP);

      await ctx.answerCbQuery("🏃 فرار کردی!");
      return ctx.reply(
        `🏃 **فرار کردی!**\n\n` +
        `در حین فرار ${penalty} HP از دست دادی.\n` +
        `❤️ HP فعلی: ${newHP}`,
        { parse_mode: "Markdown" }
      );
    }

    // ── Continue after boss ─────────────────────────────
    if (data === "dg_nextfloor") {
      const p = getPlayerData(userId);
      if (p.dungeon_floor >= DUNGEON_FLOORS.length) {
        return ctx.reply("🏆 تمام سیاه‌گرامر رو فتح کردی!");
      }

      const nextFloor = DUNGEON_FLOORS[p.dungeon_floor];
      return ctx.reply(
        `🗺️ **طبقه جدید!**\n\n` +
        `${nextFloor.emoji} **${nextFloor.name}**\n` +
        `${nextFloor.description}\n\n` +
        `برای ادامه /dungeon رو بزن`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // ── /heal — Rest and heal ─────────────────────────────
  bot.command("heal", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);

    if (player.hp >= player.max_hp) {
      return ctx.reply("❤️ HP‌ات پره! نیازی به استراحت نیست.");
    }

    const healAmount = Math.min(20, player.max_hp - player.hp);
    const newHP = player.hp + healAmount;
    setPlayerHP(userId, newHP);

    return ctx.reply(
      `💊 **استراحت کردی!**\n\n` +
      `❤️ HP: ${player.hp} → ${newHP} (+${healAmount})\n\n` +
      `💡 با معجون بیشتر درمان میشی (خرید از /dungeon)`,
      { parse_mode: "Markdown" }
    );
  });
}

// ── Monster defeated ───────────────────────────────────

async function monsterDefeated(ctx, userId, battle, player) {
  const isBoss = battle.room >= 2;
  const xpReward = battle.monster.xpReward;
  const coinReward = battle.monster.coinReward;

  addXP(userId, xpReward);
  addCoins(userId, coinReward);

  // Progress dungeon
  const floor = DUNGEON_FLOORS[battle.floorIdx];
  let newFloor = battle.floorIdx;
  let newRoom = battle.room + 1;

  if (isBoss || newRoom >= 3) {
    // Floor complete!
    newFloor = battle.floorIdx + 1;
    newRoom = 0;
  }

  const updatedPlayer = getPlayerData(userId);
  updateDungeonProgress(userId, newFloor, newRoom, updatedPlayer.hp);

  const prog = xpProgress(updatedPlayer.xp + xpReward);

  let msg =
    `🎉 **${battle.monster.name} شکست خورد!**\n\n` +
    `⭐ +${xpReward} XP | 💰 +${coinReward} سکه\n` +
    `📊 لول: ${prog.level}\n\n`;

  if (isBoss) {
    if (newFloor >= DUNGEON_FLOORS.length) {
      msg += `🏆 **تمام سیاه‌گرامر رو فتح کردی!** 🎊🎊🎊\n\nتو یه قهرمان واقعی گرامری!`;
    } else {
      const nextFloor = DUNGEON_FLOORS[newFloor];
      msg += `🗺️ **طبقه ${battle.floorIdx + 1} فتح شد!**\n\n` +
        `طبقه بعدی: ${nextFloor.emoji} **${nextFloor.name}**\n` +
        `برای ادامه /dungeon رو بزن`;
    }
  } else {
    msg += `🏠 اتاق بعدی آماده‌ست!\nبرای ادامه /dungeon رو بزن`;
  }

  return ctx.reply(msg, { parse_mode: "Markdown" });
}

// ── Player defeated ────────────────────────────────────

async function playerDefeated(ctx, userId, battle) {
  // Reset HP to 1, keep dungeon progress
  setPlayerHP(userId, 1);

  return ctx.reply(
    `💀 **شکست خوردی!**\n\n` +
    `${battle.monster.emoji} ${battle.monster.name} تو رو شکست داد...\n\n` +
    `❤️ HP تو به ۱ رسید.\n` +
    `💡 با /heal یا خرید معجون خودت رو درمان کن.\n\n` +
    `برای تلاش دوباره /dungeon رو بزن.`,
    { parse_mode: "Markdown" }
  );
}
