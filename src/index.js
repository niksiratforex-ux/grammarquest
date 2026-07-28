// 🎮 GrammarQuest — Vocab Clash + Grammar Dungeon RPG
// Main entry point

import { Telegraf } from "telegraf";
import { initDatabase } from "./data/database.js";
import { setupClashHandlers } from "./handlers/clash.js";
import { setupDungeonHandlers } from "./handlers/dungeon.js";
import { setupProfileHandlers } from "./handlers/profile.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN environment variable is required!");
  console.error("   Set it with: set BOT_TOKEN=your_token_here");
  console.error("   (PowerShell: $env:BOT_TOKEN='your_token_here')");
  process.exit(1);
}

// ── Initialize ─────────────────────────────────────────

async function main() {
  // Init database first
  await initDatabase();

  const bot = new Telegraf(BOT_TOKEN);

  // Register all handlers
  setupProfileHandlers(bot);   // /start, /help, /profile, /leaderboard, /streak, /heal
  setupClashHandlers(bot);     // /clash
  setupDungeonHandlers(bot);   // /dungeon

  // Error handling
  bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err);
    ctx.reply("❌ یه خطای غیرمنتظره رخ داد! دوباره امتحان کن.").catch(() => {});
  });

  // Launch
  console.log("⚔️ GrammarQuest starting...");

  bot.launch()
    .then(() => {
      console.log("✅ GrammarQuest is running!");
      console.log("   Press Ctrl+C to stop.");
    })
    .catch((err) => {
      console.error("❌ Failed to start:", err.message);
      process.exit(1);
    });

  // Graceful shutdown
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});
