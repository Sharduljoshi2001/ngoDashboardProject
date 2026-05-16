const express = require("express");
const db = require("../db");
const { isValidMonth } = require("../validators/month");

const router = express.Router();

router.get("/dashboard", (req, res) => {
  const { month } = req.query;

  if (!isValidMonth(month)) {
    return res.status(400).json({
      success: false,
      errors: ["month query param is required in YYYY-MM format."],
    });
  }

  try {
    const row = db.prepare(`
      SELECT
        COUNT(DISTINCT ngo_id)     AS total_ngos,
        COALESCE(SUM(people_helped), 0)    AS total_people_helped,
        COALESCE(SUM(events_conducted), 0) AS total_events_conducted,
        COALESCE(SUM(funds_utilized), 0)   AS total_funds_utilized
      FROM reports
      WHERE month = ?
    `).get(month);

    res.json({ success: true, month, data: row });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, errors: ["Internal server error."] });
  }
});

router.get("/months", (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT DISTINCT month FROM reports ORDER BY month DESC")
      .all();
    res.json({ success: true, months: rows.map((r) => r.month) });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, errors: ["Internal server error."] });
  }
});

module.exports = router;