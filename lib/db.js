import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const globalForDb = globalThis;
const db = globalForDb.lifeMirrorDb ?? new DatabaseSync(path.join(dataDir, "life-mirror.db"));
if (process.env.NODE_ENV !== "production") globalForDb.lifeMirrorDb = db;
db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'その他',
    icon TEXT NOT NULL DEFAULT 'sparkles',
    frequency TEXT NOT NULL DEFAULT '毎日',
    target INTEGER NOT NULL DEFAULT 1,
    progress INTEGER NOT NULL DEFAULT 0,
    due_time TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const columns = db.prepare("PRAGMA table_info(tasks)").all().map((column) => column.name);
if (!columns.includes("effect_area")) {
  db.exec("ALTER TABLE tasks ADD COLUMN effect_area TEXT NOT NULL DEFAULT 'none'");
  db.exec(`UPDATE tasks SET effect_area = CASE
    WHEN category = '家事' AND (title LIKE '%食器%' OR title LIKE '%自炊%' OR title LIKE '%キッチン%') THEN 'kitchen'
    WHEN category = '家事' AND (title LIKE '%ごみ%' OR title LIKE '%ゴミ%') THEN 'trash'
    WHEN category = '家事' THEN 'floor'
    WHEN category IN ('睡眠', '食事') THEN 'avatar'
    ELSE 'none' END`);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    record_date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, record_date),
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
`);

const taskColumns = db.prepare("PRAGMA table_info(tasks)").all().map((column) => column.name);
if (!taskColumns.includes("user_id")) db.exec("ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id)");

const count = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
if (count === 0) {
  const seed = db.prepare(`INSERT INTO tasks
    (title, category, icon, frequency, target, progress, due_time, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  [
    ["7時までに起きる", "睡眠", "sun", "毎日", 1, 1, "07:00", 1],
    ["部屋を掃除する", "家事", "broom", "週2回", 2, 1, null, 0],
    ["自炊する", "食事", "meal", "毎日", 3, 2, null, 0],
    ["24時までに寝る", "睡眠", "moon", "毎日", 1, 0, "24:00", 0],
    ["30分勉強する", "学習", "book", "毎日", 1, 1, null, 1]
  ].forEach((row) => seed.run(...row));
}


export default db;
