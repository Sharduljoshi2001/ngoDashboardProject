const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const apiRouter = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend in production
if (config.NODE_ENV === "production") {
  app.use(express.static(config.PUBLIC_DIR));
}

// API routes
app.use("/api", apiRouter);

// SPA fallback for production
if (config.NODE_ENV === "production") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(config.PUBLIC_DIR, "index.html"));
  });
}

module.exports = app;