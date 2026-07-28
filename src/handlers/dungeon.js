// 🧙‍♂️ Grammar Dungeon — RPG Grammar Challenges (Enhanced)

import { DUNGEON_FLOORS, getRandomQuestion, getRandomMonster, getBoss } from "../data/dungeon.js";
import {
  ensurePlayer, getPlayerData, addXP, addCoins,
  updateDungeonProgress, setPlayerHP, incrementMonsterKill,
  addToInventory, removeFromInventory, getInventory, equipItem, addDefense,
} from "../data/database.js";
import { progressBar, xpProgress, randomBetween } from "../utils/helpers.js";
import { getRandomEvent } from "../data/events.js";
import { SHOP_ITEMS, findItem, getShopDisplay } from "../data/items.js";

// Active dungeon battles by userId
const activeBattles = new Map();

export function setupDungeonHandlers(bot) {

  // ── /dungeon — Main dungeon menu ─────────────────────
  bot.command("dungeon", (ctx) => {
    const userId = ctx.from.id;
    const player = ensurePlayer(userId, ctx.from.username, ctx.from.first_name);

    if (player.hp <= 0) {
      return ctx.reply(
        "💀 **مردی!**\n\n" +
        "اول باید درمان بشی.\n" +
        "💊 /heal — استراحت (رایگان)\n" +
        "🛒 /shop — خرید معجون",
        { parse_mode: "Markdown" }
      );
    }

    if (player.dungeon_floor >= DUNGEON_FLOORS.length) {
      return ctx.reply(
        "🏆 **تو قبلاً تمام سیاه‌گرامر رو فتح کردی!**\n\n" +
        "منتظر آپدیت‌های جدید باش 😎\n" +
        "📊 /profile — آمارت رو ببین",
        { parse_mode: "Markdown" }
      );
    }

    const currentFloor = DUNGEON_FLOORS[player.dungeon_floor];
    const hpBar = progressBar(player.hp, player.max_hp, 8);
    const prog = xpProgress(player.xp);

    // Get equipped items
    const weapon = player.equipped_weapon ? findItem(player.equipped_weapon) : null;
    const armor = player.equipped_armor ? findItem(player.equipped_armor) : null;

    return ctx.reply(
      `🗺️ **سیاه‌گرامر — طبقه ${currentFloor.id}**\n` +
      `${currentFloor.emoji} **${currentFloor.name}**\n\n` +
      `${currentFloor.description}\n\n` +
      `🧑 **${ctx.from.first_name}** | لول ${prog.level}\n` +
      `❤️ ${hpBar} ${player.hp}/${player.max_hp}\n` +
      `⚔️ حمله: ${player.attack} ${weapon ? `(+${weapon.attack} ${weapon.emoji})` : ""}\n` +
      `🛡️ دفاع: ${player.defense} ${armor ? `(+${armor.defense} ${armor.emoji})` : ""}\n` +
      `💰 سکه: ${player.coins}\n` +
      `🎯 ضربه بحرانی: ${player.crit_chance}%\n\n` +
      `🏠 اتاق ${player.dungeon_room + 1}/3 — هر اتاق یه هیولا داره\n` +
      `👑 اتاق آخر = باس‌فایت!\n` +
      `🎲 هر اتاق ممکنه رویداد تصادفی داشته باشه\n\n` +
      `کجا می‌خوای بری؟`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚔️ وارد اتاق بعدی شو", callback_data: "dg_enter" }],
            [{ text: "🎲 رویداد تصادفی", callback_data: "dg_event" }],
            [
              { text: "🧪 معجون‌ها", callback_data: "dg_potions" },
              { text: "🎒 کوله‌پشتی", callback_data: "dg_inventory" },
            ],
            [
              { text: "🗡️ ارتقا حمله (+3) — 20💰", callback_data: "dg_upgrade_atk" },
              { text: "🛡️ ارتقا دفاع (+2) — 20💰", callback_data: "dg_upgrade_def" },
            ],
            [{ text: "🛒 فروشگاه", callback_data: "dg_shop_menu" }],
          ],
        },
      }
    );
  });

  // ── Random event ─────────────────────────────────────
  // (registered in callback handler below)

  // ── /shop — Shop menu ────────────────────────────────
  bot.command("shop", (ctx) => {
    return showShopMenu(ctx);
  });

  // ── /heal — Rest and heal ────────────────────────────
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
      `💡 با معجون بیشتر درمان میشی (🛒 /shop)`,
      { parse_mode: "Markdown" }
    );
  });

  // ── /inventory — View inventory ──────────────────────
  bot.command("inventory", (ctx) => {
    return showInventory(ctx, ctx.from.id);
  });

  // ── Callback handler ──────────────────────────────────
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    if (!data.startsWith("dg_") && !data.startsWith("shop_")) return;

    const player = getPlayerData(userId);
    if (!player) {
      return ctx.answerCbQuery("❌ اول /start رو بزن!");
    }

    // ── Random event ───────────────────────────────────
    if (data === "dg_event") {
      const event = getRandomEvent();
      const result = event.effect(player);

      let changes = [];
      if (result.coins) { addCoins(userId, result.coins); changes.push(`+${result.coins} سکه`); }
      if (result.xp) { addXP(userId, result.xp); changes.push(`+${result.xp} XP`); }
      if (result.heal) {
        const newHP = Math.min(player.hp + result.heal, player.max_hp);
        setPlayerHP(userId, newHP);
        changes.push(`+${result.heal} HP`);
      }
      if (result.damage) {
        const newHP = Math.max(1, player.hp - result.damage);
        setPlayerHP(userId, newHP);
        changes.push(`-${result.damage} HP`);
      }
      if (result.freePotion) {
        addToInventory(userId, "small_potion", 1);
        changes.push("+1 معجون کوچک");
      }

      await ctx.answerCbQuery(event.emoji + " " + event.name);
      return ctx.reply(
        `${event.emoji} **${event.name}**\n\n` +
        `${result.message}\n\n` +
        (changes.length > 0 ? `📊 تغییرات: ${changes.join(" | ")}` : ""),
        { parse_mode: "Markdown" }
      );
    }

    // ── Shop menu ──────────────────────────────────────
    if (data === "dg_shop_menu") {
      return showShopMenu(ctx);
    }

    // ── Shop categories ────────────────────────────────
    if (data.startsWith("shop_cat_")) {
      const cat = data.replace("shop_cat_", "");
      const display = getShopDisplay(cat);
      if (!display) return ctx.answerCbQuery("❌ دسته‌بندی نامعتبر");

      const categoryNames = { weapons: "🗡️ سلاح‌ها", armor: "🛡️ زره‌ها", potions: "🧪 معجون‌ها", special: "✨ آیتم‌های ویژه" };
      const items = SHOP_ITEMS[cat];
      const keyboard = items.map(item => [{
        text: `${item.emoji} ${item.name} — ${item.price}💰`,
        callback_data: `shop_buy_${item.id}`,
      }]);
      keyboard.push([{ text: "🔙 بازگشت به فروشگاه", callback_data: "dg_shop_menu" }]);

      await ctx.answerCbQuery();
      return ctx.reply(
        `🛒 **${categoryNames[cat] || cat}**\n\n${display}`,
        { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } }
      );
    }

    // ── Buy item ───────────────────────────────────────
    if (data.startsWith("shop_buy_")) {
      const itemId = data.replace("shop_buy_", "");
      const item = findItem(itemId);
      if (!item) return ctx.answerCbQuery("❌ آیتم پیدا نشد");

      if (player.coins < item.price) {
        return ctx.answerCbQuery(`💰 سکه کافی نیست! ${item.price} سکه لازمه.`);
      }

      addCoins(userId, -item.price);

      // Check if it's equipment or consumable
      if (item.attack || item.defense) {
        // Equipment - auto equip
        addToInventory(userId, itemId, 1);
        if (item.attack) equipItem(userId, "weapon", itemId);
        if (item.defense) equipItem(userId, "armor", itemId);

        await ctx.answerCbQuery(`${item.emoji} ${item.name} خریدی و استفاده کردی!`);
        return ctx.reply(
          `🛒 **خرید موفق!**\n\n` +
          `${item.emoji} **${item.name}** خریداری و تجهیز شد!\n` +
          `${item.desc}\n\n` +
          `💰 ${item.price} سکه خرج شد`,
          { parse_mode: "Markdown" }
        );
      } else {
        // Consumable
        addToInventory(userId, itemId, 1);
        await ctx.answerCbQuery(`${item.emoji} ${item.name} خریدی!`);
        return ctx.reply(
          `🛒 **خرید موفق!**\n\n` +
          `${item.emoji} **${item.name}** به کوله‌پشتیت اضافه شد!\n` +
          `🎒 برای استفاده: /inventory\n\n` +
          `💰 ${item.price} سکه خرج شد`,
          { parse_mode: "Markdown" }
        );
      }
    }

    // ── Inventory ──────────────────────────────────────
    if (data === "dg_inventory") {
      return showInventory(ctx, userId);
    }

    // ── Use potion ─────────────────────────────────────
    if (data.startsWith("dg_use_")) {
      const itemId = data.replace("dg_use_", "");
      const item = findItem(itemId);
      if (!item) return ctx.answerCbQuery("❌ آیتم پیدا نشد");

      const inv = getInventory(userId);
      const has = inv.find(i => i.item_id === itemId);
      if (!has || has.quantity <= 0) {
        return ctx.answerCbQuery("❌ این آیتم رو نداری!");
      }

      if (item.heal) {
        removeFromInventory(userId, itemId, 1);
        const newHP = Math.min(player.hp + item.heal, player.max_hp);
        const healed = newHP - player.hp;
        setPlayerHP(userId, newHP);

        await ctx.answerCbQuery(`${item.emoji} ${item.name} استفاده شد! +${healed} HP`);
        return ctx.reply(
          `${item.emoji} **${item.name}** استفاده شد!\n\n` +
          `❤️ HP: ${player.hp} → ${newHP} (+${healed})`,
          { parse_mode: "Markdown" }
        );
      }

      if (item.xpBoost) {
        removeFromInventory(userId, itemId, 1);
        addXP(userId, 50);
        await ctx.answerCbQuery(`${item.emoji} +50 XP!`);
        return ctx.reply(`${item.emoji} **طومار XP** استفاده شد! ⭐ +50 XP`, { parse_mode: "Markdown" });
      }

      return ctx.answerCbQuery("❌ این آیتم قابل استفاده نیست.");
    }

    // ── Upgrade attack ─────────────────────────────────
    if (data === "dg_upgrade_atk") {
      if (player.coins < 20) {
        return ctx.answerCbQuery("💰 سکه‌ات کافی نیست! (20 سکه لازمه)");
      }
      addCoins(userId, -20);
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
      addDefense(userId, 2);
      await ctx.answerCbQuery("🛡️ دفاع ارتقا یافت! +2");
      return ctx.reply(`🛡️ **دفاع ارتقا یافت!** 🛡️ ${player.defense} → ${player.defense + 2}`, { parse_mode: "Markdown" });
    }

    // ── Potion shop (quick) ────────────────────────────
    if (data === "dg_potions") {
      const inv = getInventory(userId);
      const potions = inv.filter(i => {
        const item = findItem(i.item_id);
        return item && item.heal;
      });

      if (potions.length === 0) {
        return ctx.reply(
          "🧪 **معجون نداری!**\n\n" +
          "از 🛒 /shop بخر یا:\n" +
          "💊 /heal — استراحت رایگان (+20 HP)",
          { parse_mode: "Markdown" }
        );
      }

      const keyboard = potions.map(p => {
        const item = findItem(p.item_id);
        return [{ text: `${item.emoji} ${item.name} (×${p.quantity}) — ${item.desc}`, callback_data: `dg_use_${p.item_id}` }];
      });
      keyboard.push([{ text: "🔙 بازگشت", callback_data: "dg_back" }]);

      return ctx.reply("🧪 **معجون‌هات:**", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard },
      });
    }

    // ── Back to dungeon ────────────────────────────────
    if (data === "dg_back") {
      await ctx.answerCbQuery();
      // Re-trigger dungeon command
      const p = getPlayerData(userId);
      const currentFloor = DUNGEON_FLOORS[p.dungeon_floor];
      const hpBar = progressBar(p.hp, p.max_hp, 8);
      const prog = xpProgress(p.xp);
      const weapon = p.equipped_weapon ? findItem(p.equipped_weapon) : null;
      const armor = p.equipped_armor ? findItem(p.equipped_armor) : null;

      return ctx.reply(
        `🗺️ **سیاه‌گرامر — طبقه ${currentFloor.id}**\n` +
        `${currentFloor.emoji} **${currentFloor.name}**\n\n` +
        `🧑 ${ctx.from.first_name} | لول ${prog.level}\n` +
        `❤️ ${hpBar} ${p.hp}/${p.max_hp}\n` +
        `⚔️ حمله: ${p.attack} ${weapon ? weapon.emoji : ""} | 🛡️ دفاع: ${p.defense} ${armor ? armor.emoji : ""}\n` +
        `💰 سکه: ${p.coins}\n\n` +
        `🏠 اتاق ${p.dungeon_room + 1}/3`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚔️ وارد اتاق بعدی شو", callback_data: "dg_enter" }],
              [{ text: "🎲 رویداد تصادفی", callback_data: "dg_event" }],
              [
                { text: "🧪 معجون‌ها", callback_data: "dg_potions" },
                { text: "🛒 فروشگاه", callback_data: "dg_shop_menu" },
              ],
            ],
          },
        }
      );
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
      const isBoss = room >= 2;
      const monster = isBoss ? getBoss(floorIdx) : getRandomMonster(floorIdx);

      if (!monster) return ctx.answerCbQuery("❌ هیولایی پیدا نشد!");

      const topic = floor.grammarTopics[Math.floor(Math.random() * floor.grammarTopics.length)];

      // Apply weapon bonus
      const weapon = player.equipped_weapon ? findItem(player.equipped_weapon) : null;
      const totalAttack = player.attack + (weapon ? weapon.attack : 0);

      activeBattles.set(userId, {
        monster: { ...monster, currentHP: monster.hp },
        floorIdx,
        room,
        topic,
        turn: 0,
        playerAttack: totalAttack,
        shieldActive: false,
      });

      await ctx.answerCbQuery(`⚔️ ${monster.emoji} ${monster.name} ظاهر شد!`);

      return ctx.reply(
        `${isBoss ? "👑 **باس‌فایت!**" : "⚔️ **مبارزه!**"}\n\n` +
        `${monster.emoji} **${monster.name}**\n` +
        `❤️ HP: ${monster.hp}/${monster.hp}\n` +
        `⚔️ حمله: ${monster.attack}\n\n` +
        `🗺️ ${floor.emoji} ${floor.name} — اتاق ${room + 1}\n\n` +
        `برای حمله باید سوال گرامری حل کنی!\n` +
        `💡 جواب درست = آسیب به هیولا | غلط = هیولا آسیب می‌زنه`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚔️ حمله!", callback_data: "dg_attack" }],
              [
                { text: "🧪 معجون", callback_data: "dg_use_potion_battle" },
                { text: "🏃 فرار", callback_data: "dg_flee" },
              ],
            ],
          },
        }
      );
    }

    // ── Use potion in battle ────────────────────────────
    if (data === "dg_use_potion_battle") {
      const inv = getInventory(userId);
      const potions = inv.filter(i => {
        const item = findItem(i.item_id);
        return item && item.heal;
      });

      if (potions.length === 0) {
        return ctx.answerCbQuery("🧪 معجون نداری!");
      }

      // Use the best potion
      const bestPotion = potions.reduce((best, p) => {
        const item = findItem(p.item_id);
        const bestItem = findItem(best.item_id);
        return (item.heal > bestItem.heal) ? p : best;
      });

      const item = findItem(bestPotion.item_id);
      removeFromInventory(userId, bestPotion.item_id, 1);
      const newHP = Math.min(player.hp + item.heal, player.max_hp);
      setPlayerHP(userId, newHP);

      await ctx.answerCbQuery(`${item.emoji} +${newHP - player.hp} HP!`);
      return ctx.reply(`${item.emoji} **${item.name}** استفاده شد! ❤️ ${player.hp} → ${newHP}`, { parse_mode: "Markdown" });
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

      const mBar = progressBar(battle.monster.currentHP, battle.monster.hp, 8);
      const freshPlayer = getPlayerData(userId);
      const pBar = progressBar(freshPlayer.hp, freshPlayer.max_hp, 8);

      return ctx.reply(
        `⚔️ **حمله!** (نوبت ${battle.turn})\n\n` +
        `❓ ${question.q}\n\n` +
        `${battle.monster.emoji} ❤️ ${mBar} ${battle.monster.currentHP}/${battle.monster.hp}\n` +
        `🧑 ❤️ ${pBar} ${freshPlayer.hp}/${freshPlayer.max_hp}`,
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
      const armor = freshPlayer.equipped_armor ? findItem(freshPlayer.equipped_armor) : null;
      const totalDefense = freshPlayer.defense + (armor ? armor.defense : 0);

      let resultText;

      if (isCorrect) {
        // Player attacks — check for critical hit
        const isCrit = Math.random() * 100 < freshPlayer.crit_chance;
        const variance = Math.floor(Math.random() * 5);
        let damage = Math.max(5, battle.playerAttack - variance);
        if (isCrit) damage = Math.floor(damage * 1.8);

        battle.monster.currentHP = Math.max(0, battle.monster.currentHP - damage);
        resultText = isCrit
          ? `💥 **ضربه بحرانی!** ${damage} آسیب به ${battle.monster.name}!`
          : `✅ **درست!** 💥 ${damage} آسیب به ${battle.monster.name}!`;
      } else {
        // Monster attacks
        let damage = Math.max(3, battle.monster.attack - Math.floor(totalDefense / 3));

        // Check shield
        if (battle.shieldActive) {
          battle.shieldActive = false;
          resultText = `❌ **غلط!** جواب درست: **${battle.currentQuestion.answer}**\n` +
            `🔰 طومار محافظت حمله رو دفع کرد!`;
        } else {
          const newHP = Math.max(0, freshPlayer.hp - damage);
          setPlayerHP(userId, newHP);
          resultText = `❌ **غلط!** جواب درست: **${battle.currentQuestion.answer}**\n` +
            `💥 ${battle.monster.emoji} ${battle.monster.name} ${damage} آسیب بهت زد!`;
        }
      }

      await ctx.answerCbQuery(isCorrect ? "✅ درست!" : "❌ غلط!");

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
              [
                { text: "🧪 معجون", callback_data: "dg_use_potion_battle" },
                { text: "🏃 فرار", callback_data: "dg_flee" },
              ],
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
  });
}

// ── Shop menu display ──────────────────────────────────

async function showShopMenu(ctx) {
  await ctx.answerCbQuery().catch(() => {});
  return ctx.reply(
    `🛒 **فروشگاه GrammarQuest**\n\n` +
    `آیتم بخر و قوی‌تر شو!\n\n` +
    `🗡️ سلاح‌ها — حمله رو زیاد کن\n` +
    `🛡️ زره‌ها — دفاع رو زیاد کن\n` +
    `🧪 معجون‌ها — HP درمان کن\n` +
    `✨ آیتم‌های ویژه — قابلیت‌های خاص`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🗡️ سلاح‌ها", callback_data: "shop_cat_weapons" }],
          [{ text: "🛡️ زره‌ها", callback_data: "shop_cat_armor" }],
          [{ text: "🧪 معجون‌ها", callback_data: "shop_cat_potions" }],
          [{ text: "✨ آیتم‌های ویژه", callback_data: "shop_cat_special" }],
        ],
      },
    }
  );
}

// ── Inventory display ──────────────────────────────────

async function showInventory(ctx, userId) {
  const inv = getInventory(userId);
  const player = getPlayerData(userId);

  if (inv.length === 0) {
    return ctx.reply(
      "🎒 **کوله‌پشتیت خالیه!**\n\n" +
      "از 🛒 /shop آیتم بخر.",
      { parse_mode: "Markdown" }
    );
  }

  const weapon = player.equipped_weapon ? findItem(player.equipped_weapon) : null;
  const armor = player.equipped_armor ? findItem(player.equipped_armor) : null;

  let text = "🎒 **کوله‌پشتی:**\n\n";

  if (weapon) text += `🗡️ تجهیز: ${weapon.emoji} ${weapon.name} (+${weapon.attack} حمله)\n`;
  if (armor) text += `🛡️ تجهیز: ${armor.emoji} ${armor.name} (+${armor.defense} دفاع)\n`;
  text += "\n";

  const keyboard = [];
  for (const invItem of inv) {
    const item = findItem(invItem.item_id);
    if (!item) continue;
    text += `${item.emoji} **${item.name}** ×${invItem.quantity} — ${item.desc}\n`;
    if (item.heal || item.xpBoost) {
      keyboard.push([{ text: `${item.emoji} استفاده ${item.name} (×${invItem.quantity})`, callback_data: `dg_use_${item.id}` }]);
    }
  }

  keyboard.push([{ text: "🛒 فروشگاه", callback_data: "dg_shop_menu" }]);

  await ctx.answerCbQuery().catch(() => {});
  return ctx.reply(text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } });
}

// ── Monster defeated ───────────────────────────────────

async function monsterDefeated(ctx, userId, battle, player) {
  const isBoss = battle.room >= 2;
  const xpReward = battle.monster.xpReward;
  const coinReward = battle.monster.coinReward;

  addXP(userId, xpReward);
  addCoins(userId, coinReward);
  incrementMonsterKill(userId);

  // Random drop
  let dropText = "";
  const dropChance = Math.random();
  if (dropChance < 0.3) {
    const potions = ["small_potion", "medium_potion"];
    const dropped = potions[Math.floor(Math.random() * potions.length)];
    addToInventory(userId, dropped, 1);
    const item = findItem(dropped);
    dropText = `\n🎁 افتادن آیتم: ${item.emoji} ${item.name}!`;
  }

  // Progress dungeon
  const floor = DUNGEON_FLOORS[battle.floorIdx];
  let newFloor = battle.floorIdx;
  let newRoom = battle.room + 1;

  if (isBoss || newRoom >= 3) {
    newFloor = battle.floorIdx + 1;
    newRoom = 0;
  }

  const updatedPlayer = getPlayerData(userId);
  updateDungeonProgress(userId, newFloor, newRoom, updatedPlayer.hp);

  const prog = xpProgress(updatedPlayer.xp + xpReward);

  let msg =
    `🎉 **${battle.monster.name} شکست خورد!**\n\n` +
    `⭐ +${xpReward} XP | 💰 +${coinReward} سکه\n` +
    `📊 لول: ${prog.level}` +
    dropText + "\n\n";

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
