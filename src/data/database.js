import initSqlJs from "sql.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, "../../data.db");

let db = null;

// ── Initialize database ────────────────────────────────

export async function initDatabase() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // ── Schema ──────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      user_id     INTEGER PRIMARY KEY,
      username    TEXT,
      first_name  TEXT,
      level       INTEGER DEFAULT 1,
      xp          INTEGER DEFAULT 0,
      coins       INTEGER DEFAULT 50,
      hp          INTEGER DEFAULT 100,
      max_hp      INTEGER DEFAULT 100,
      attack      INTEGER DEFAULT 10,
      defense     INTEGER DEFAULT 5,
      dungeon_floor   INTEGER DEFAULT 0,
      dungeon_room    INTEGER DEFAULT 0,
      inventory   TEXT DEFAULT '[]',
      wins        INTEGER DEFAULT 0,
      losses      INTEGER DEFAULT 0,
      streak      INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS battles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      challenger  INTEGER NOT NULL,
      opponent    INTEGER NOT NULL,
      winner      INTEGER,
      challenger_score INTEGER DEFAULT 0,
      opponent_score   INTEGER DEFAULT 0,
      difficulty  TEXT DEFAULT 'easy',
      created_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDB();
  console.log("✅ Database initialized");
  return db;
}

// ── Save to disk ───────────────────────────────────────

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

// ── Helper: run query and return rows ──────────────────

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

// ── Player CRUD ────────────────────────────────────────

export function ensurePlayer(userId, username, firstName) {
  const existing = queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
  if (existing) return existing;

  run(
    "INSERT OR IGNORE INTO players (user_id, username, first_name) VALUES (?, ?, ?)",
    [userId, username || "", firstName || ""]
  );
  return queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
}

export function getPlayerData(userId) {
  return queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
}

export function addXP(userId, amount) {
  const player = queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
  if (!player) return null;
  const newXP = player.xp + amount;
  const newLevel = Math.floor(newXP / 100) + 1;
  run("UPDATE players SET xp = ?, level = ?, updated_at = datetime('now') WHERE user_id = ?", [newXP, newLevel, userId]);
  return { ...player, xp: newXP, level: newLevel, leveledUp: newLevel > player.level };
}

export function addCoins(userId, amount) {
  run("UPDATE players SET coins = coins + ?, updated_at = datetime('now') WHERE user_id = ?", [amount, userId]);
  return queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
}

export function spendCoins(userId, amount) {
  const player = queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
  if (!player || player.coins < amount) return false;
  run("UPDATE players SET coins = coins - ?, updated_at = datetime('now') WHERE user_id = ?", [amount, userId]);
  return true;
}

export function recordBattle(challenger, opponent, winner, cScore, oScore, difficulty) {
  run(
    "INSERT INTO battles (challenger, opponent, winner, challenger_score, opponent_score, difficulty) VALUES (?, ?, ?, ?, ?, ?)",
    [challenger, opponent, winner, cScore, oScore, difficulty]
  );
}

export function updateBattleResult(userId, won) {
  const player = queryOne("SELECT * FROM players WHERE user_id = ?", [userId]);
  if (!player) return;
  const streak = won ? player.streak + 1 : 0;
  const best = Math.max(streak, player.best_streak);
  run(
    "UPDATE players SET wins = wins + ?, losses = losses + ?, streak = ?, best_streak = ?, updated_at = datetime('now') WHERE user_id = ?",
    [won ? 1 : 0, won ? 0 : 1, streak, best, userId]
  );
}

export function updateDungeonProgress(userId, floor, room, hp) {
  run("UPDATE players SET dungeon_floor = ?, dungeon_room = ?, hp = ?, updated_at = datetime('now') WHERE user_id = ?", [floor, room, hp, userId]);
}

export function setPlayerHP(userId, hp) {
  run("UPDATE players SET hp = ?, updated_at = datetime('now') WHERE user_id = ?", [hp, userId]);
}

export function setPlayerAttack(userId, attack) {
  run("UPDATE players SET attack = ?, updated_at = datetime('now') WHERE user_id = ?", [attack, userId]);
}

export function getTopPlayers() {
  return queryAll("SELECT user_id, username, first_name, level, xp, coins, wins, streak FROM players ORDER BY xp DESC LIMIT 20");
}

export function getTopStreaks() {
  return queryAll("SELECT user_id, username, first_name, level, streak FROM players WHERE streak > 0 ORDER BY streak DESC LIMIT 10");
}

export { db };
