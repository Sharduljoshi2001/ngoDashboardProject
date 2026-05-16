const fs = require("fs");
const Database = require("better-sqlite3");
const config = require("../config");

fs.mkdirSync(config.DB_DIR, { recursive: true });

const db = new Database(config.DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ngo_id TEXT NOT NULL,
    month TEXT NOT NULL,
    people_helped INTEGER NOT NULL DEFAULT 0,
    events_conducted INTEGER NOT NULL DEFAULT 0,
    funds_utilized REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(ngo_id, month)
  )
`);

module.exports = db;