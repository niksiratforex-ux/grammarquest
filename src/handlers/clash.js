// ⚔️ Vocab Clash — 1v1 Vocabulary Battle

import { getRandomWord, getShuffledOptions, DIFFICULTY_CONFIG } from "../data/words.js";
import { ensurePlayer, addXP, addCoins, recordBattle, updateBattleResult } from "../data/database.js";

// Active clash sessions by chatId
const activeClashes = new Map();
// Pending challenges by opponentId
const pendingChallenges = new Map();

export function setupClashHandlers(bot) {

  // ── /clash [easy|medium|hard] ─────────────────────────
  bot.command("clash", (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    const difficulty = args[0] || "easy";

    if (!DIFFICULTY_CONFIG[difficulty]) {
      return ctx.reply(
        "⚔️ **Vocab Clash — نبرد لغات**\n\n" +
        "یکی رو به نبرد دعوت کن!\n\n" +
        "📋 **دستورات:**\n" +
        "`/clash easy` — چالش آسان\n" +
        "`/clash medium` — چالش متوسط\n" +
        "`/clash hard` — چالش سخت\n\n" +
        "💡 روی پیام کسی ریپلای کن و `/clash` بزن تا مستقیم دعوتش کنی",
        { parse_mode: "Markdown" }
      );
    }

    const challengerId = ctx.from.id;
    const chatId = ctx.chat.id;
    const config = DIFFICULTY_CONFIG[difficulty];

    // Direct challenge via reply
    const replyTo = ctx.message.reply_to_message;
    if (replyTo && replyTo.from && !replyTo.from.is_bot) {
      const opponentId = replyTo.from.id;
      if (opponentId === challengerId) {
        return ctx.reply("🤦 نمی‌تونی با خودت بجنگی!");
      }

      pendingChallenges.set(opponentId, {
        challengerId,
        chatId,
        difficulty,
        challengerName: ctx.from.first_name,
      });

      // Auto-expire challenge after 30s
      setTimeout(() => pendingChallenges.delete(opponentId), 30000);

      return ctx.reply(
        `⚔️ **${ctx.from.first_name}** تو رو به نبرد لغات دعوت کرد!\n\n` +
        `🎯 سطح: ${config.label}\n` +
        `⏱️ هر سوال: ${config.timeLimit} ثانیه\n` +
        `📝 ۵ دور\n\n` +
        `**${replyTo.from.first_name}**، قبول می‌کنی؟`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ قبول!", callback_data: `cx_accept` },
                { text: "❌ نه ممنون", callback_data: `cx_decline` },
              ],
            ],
          },
        }
      );
    }

    // Open lobby mode
    if (activeClashes.has(chatId)) {
      return ctx.reply("⏳ یه نبرد در حال انجامه! صبر کن تموم بشه.");
    }

    activeClashes.set(chatId, {
      state: "waiting",
      challengerId,
      difficulty,
    });

    // Auto-expire lobby after 60s
    setTimeout(() => {
      const c = activeClashes.get(chatId);
      if (c && c.state === "waiting") {
        activeClashes.delete(chatId);
        ctx.reply("⏰ وقت انتظار تموم شد. کسی نیومد 😢").catch(() => {});
      }
    }, 60000);

    return ctx.reply(
      `⚔️ **نبرد لغات ${config.label}**\n\n` +
      `🎮 **${ctx.from.first_name}** منتظر حریفه!\n\n` +
      `برای پیوستن دکمه زیر رو بزن 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 پیوستن به نبرد!", callback_data: `cx_join` }],
          ],
        },
      }
    );
  });

  // ── Callback handler ──────────────────────────────────
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    // ── Accept direct challenge ─────────────────────────
    if (data === "cx_accept") {
      const pending = pendingChallenges.get(userId);
      if (!pending) return ctx.answerCbQuery("⏳ وقت تموم شد یا چالش لغو شد.");
      pendingChallenges.delete(userId);
      await ctx.answerCbQuery("⚔️ نبرد شروع شد!");
      await ctx.editMessageText("⚔️ نبرد شروع شد! آماده شید...");
      return startClash(ctx, pending.challengerId, userId, pending.chatId, pending.difficulty);
    }

    // ── Decline challenge ───────────────────────────────
    if (data === "cx_decline") {
      pendingChallenges.delete(userId);
      await ctx.answerCbQuery("❌ رد شد");
      return ctx.editMessageText("❌ چالش رد شد.");
    }

    // ── Join open lobby ─────────────────────────────────
    if (data === "cx_join") {
      const clash = activeClashes.get(chatId);
      if (!clash || clash.state !== "waiting") {
        return ctx.answerCbQuery("⏳ نبرد تموم شده.");
      }
      if (clash.challengerId === userId) {
        return ctx.answerCbQuery("🤦 نمی‌تونی با خودت بجنگی!");
      }
      await ctx.answerCbQuery("🎮 وارد نبرد شدی!");
      await ctx.editMessageText("⚔️ حریف پیدا شد! نبرد شروع میشه...");
      return startClash(ctx, clash.challengerId, userId, chatId, clash.difficulty);
    }

    // ── Answer a question ───────────────────────────────
    if (data.startsWith("cq_")) {
      const clash = activeClashes.get(chatId);
      if (!clash || clash.state !== "active") {
        return ctx.answerCbQuery("⏳ نبرد تموم شده.");
      }

      const answerIndex = parseInt(data.split("_")[1]);

      // Determine which player
      let playerSlot = -1;
      if (userId === clash.challengerId) playerSlot = 0;
      else if (userId === clash.opponentId) playerSlot = 1;
      else return ctx.answerCbQuery("❌ تو توی این نبرد نیستی!");

      // Already answered?
      if (clash.answers[playerSlot] !== null) {
        return ctx.answerCbQuery("⏳ قبلاً جواب دادی!");
      }

      const word = clash.currentWord;
      const selected = word.options[answerIndex];
      const isCorrect = selected === word.meaning;
      const elapsed = Date.now() - clash.questionStartTime;

      clash.answers[playerSlot] = { correct: isCorrect, time: elapsed };

      if (isCorrect) {
        const config = DIFFICULTY_CONFIG[clash.difficulty];
        const timeBonus = Math.max(0, Math.floor((config.timeLimit * 1000 - elapsed) / 300));
        clash.scores[playerSlot] += config.pointsBase + timeBonus;
      }

      await ctx.answerCbQuery(isCorrect ? "✅ درست! +" + DIFFICULTY_CONFIG[clash.difficulty].pointsBase : "❌ غلط!");

      // Both answered? Show result
      if (clash.answers[0] !== null && clash.answers[1] !== null) {
        return showRoundResult(ctx, clash, chatId);
      }
    }
  });
}

// ── Start clash ────────────────────────────────────────

async function startClash(ctx, challengerId, opponentId, chatId, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];

  ensurePlayer(challengerId);
  ensurePlayer(opponentId);

  const clash = {
    state: "active",
    challengerId,
    opponentId,
    difficulty,
    round: 0,
    totalRounds: 5,
    scores: [0, 0],
    currentWord: null,
    answers: [null, null],
    questionStartTime: null,
    questionTimer: null,
  };

  activeClashes.set(chatId, clash);

  await ctx.reply(
    `⚔️ **نبرد شروع شد!**\n\n` +
    `🎯 سطح: ${config.label}\n` +
    `⏱️ هر سوال: ${config.timeLimit} ثانیه\n` +
    `📝 ۵ دور\n\n` +
    `۳... ۲... ۱... 🚀`,
    { parse_mode: "Markdown" }
  );

  setTimeout(() => sendQuestion(ctx, clash, chatId), 2000);
}

// ── Send question ──────────────────────────────────────

async function sendQuestion(ctx, clash, chatId) {
  if (clash.round >= clash.totalRounds) {
    return endClash(ctx, clash, chatId);
  }

  clash.round++;
  clash.answers = [null, null];

  const word = getRandomWord(clash.difficulty);
  clash.currentWord = { ...word, options: getShuffledOptions(word) };
  clash.questionStartTime = Date.now();

  const config = DIFFICULTY_CONFIG[clash.difficulty];
  const emojis = ["🇦", "🇧", "🇨", "🇩"];

  const keyboard = clash.currentWord.options.map((opt, i) => [
    { text: `${emojis[i]} ${opt}`, callback_data: `cq_${i}` },
  ]);

  await ctx.reply(
    `⚔️ **دور ${clash.round}/${clash.totalRounds}**\n\n` +
    `📖 معنی این کلمه چیه؟\n\n` +
    `🔤 **${clash.currentWord.word}**\n\n` +
    `📊 امتیاز: ${clash.scores[0]} — ${clash.scores[1]}\n` +
    `⏱️ ${config.timeLimit} ثانیه وقت دارید`,
    { parse_mode: "Markdown", reply_markup: { inline_keyboard: keyboard } }
  );

  // Timeout
  clash.questionTimer = setTimeout(() => {
    if (clash.state !== "active") return;
    if (clash.answers[0] === null) clash.answers[0] = { correct: false, time: config.timeLimit * 1000 };
    if (clash.answers[1] === null) clash.answers[1] = { correct: false, time: config.timeLimit * 1000 };
    showRoundResult(ctx, clash, chatId);
  }, (config.timeLimit + 1) * 1000);
}

// ── Show round result ──────────────────────────────────

async function showRoundResult(ctx, clash, chatId) {
  if (clash.questionTimer) clearTimeout(clash.questionTimer);

  const word = clash.currentWord;
  const a0 = clash.answers[0];
  const a1 = clash.answers[1];
  const config = DIFFICULTY_CONFIG[clash.difficulty];

  const r0 = a0?.correct ? `✅ +${config.pointsBase}` : "❌ غلط";
  const r1 = a1?.correct ? `✅ +${config.pointsBase}` : "❌ غلط";
  const t0 = ((a0?.time || 0) / 1000).toFixed(1);
  const t1 = ((a1?.time || 0) / 1000).toFixed(1);

  await ctx.reply(
    `📝 **نتیجه دور ${clash.round}**\n\n` +
    `🔤 **${word.word}** = ${word.meaning}\n\n` +
    `👤 بازیکن ۱: ${r0} (${t0}s)\n` +
    `👤 بازیکن ۲: ${r1} (${t1}s)\n\n` +
    `📊 امتیاز کل: **${clash.scores[0]} — ${clash.scores[1]}**`,
    { parse_mode: "Markdown" }
  );

  setTimeout(() => sendQuestion(ctx, clash, chatId), 2500);
}

// ── End clash ──────────────────────────────────────────

async function endClash(ctx, clash, chatId) {
  clash.state = "finished";
  activeClashes.delete(chatId);

  const s0 = clash.scores[0];
  const s1 = clash.scores[1];
  const winner = s0 > s1 ? 0 : s0 < s1 ? 1 : -1;
  const config = DIFFICULTY_CONFIG[clash.difficulty];

  const winXP = config.pointsBase * 3;
  const loseXP = config.pointsBase;
  const winCoins = config.coinsBase * 2;
  const loseCoins = Math.floor(config.coinsBase / 2);

  if (winner >= 0) {
    const winnerId = winner === 0 ? clash.challengerId : clash.opponentId;
    const loserId = winner === 0 ? clash.opponentId : clash.challengerId;

    addXP(winnerId, winXP);
    addXP(loserId, loseXP);
    addCoins(winnerId, winCoins);
    addCoins(loserId, loseCoins);
    recordBattle(clash.challengerId, clash.opponentId, winnerId, s0, s1, clash.difficulty);
    updateBattleResult(winnerId, true);
    updateBattleResult(loserId, false);

    await ctx.reply(
      `🏆 **نبرد تمام شد!**\n\n` +
      `📊 ${s0} — ${s1}\n\n` +
      `🥇 برنده: بازیکن ${winner + 1}!\n` +
      `🏅 +${winXP} XP | +${winCoins} سکه\n` +
      `🥈 بازنده: +${loseXP} XP | +${loseCoins} سکه`,
      { parse_mode: "Markdown" }
    );
  } else {
    addXP(clash.challengerId, loseXP);
    addXP(clash.opponentId, loseXP);
    addCoins(clash.challengerId, loseCoins);
    addCoins(clash.opponentId, loseCoins);

    await ctx.reply(
      `🤝 **مساوی!** ${s0} — ${s1}\n\n` +
      `هر دو بازیکن +${loseXP} XP | +${loseCoins} سکه`,
      { parse_mode: "Markdown" }
    );
  }
}
