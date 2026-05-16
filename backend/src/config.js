const path = require("path");

const ROOT = path.join(__dirname, "..");

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_DIR: path.join(ROOT, "database"),
  get DB_PATH() {
    return process.env.DB_PATH || path.join(this.DB_DIR, "data.db");
  },
  PUBLIC_DIR: path.join(ROOT, "public"),
};