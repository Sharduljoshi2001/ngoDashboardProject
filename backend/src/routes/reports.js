const express = require("express");
const db = require("../db");
const { validateReport } = require("../validators/report");

const router = express.Router();

router.post("/report", (req, res) => {
  const errors = validateReport(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const { ngo_id, month, people_helped, events_conducted, funds_utilized } =
    req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(ngo_id, month) DO UPDATE SET
        people_helped = excluded.people_helped,
        events_conducted = excluded.events_conducted,
        funds_utilized = excluded.funds_utilized,
        created_at = datetime('now')
    `);

    const info = stmt.run(
      ngo_id.trim(),
      month,
      people_helped,
      events_conducted,
      funds_utilized
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      id: info.lastInsertRowid,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, errors: ["Internal server error."] });
  }
});

module.exports = router;