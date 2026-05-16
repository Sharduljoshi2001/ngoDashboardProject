const express = require("express");
const reportsRouter = require("./reports");
const dashboardRouter = require("./dashboard");

const router = express.Router();

router.use(reportsRouter);
router.use(dashboardRouter);

module.exports = router;