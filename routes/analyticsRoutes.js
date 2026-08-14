const express = require("express");

const router = express.Router();

const {
  getWeeklyAnalytics,
  getDailyAnalytics,
} = require("../controllers/analyticsController");


router.get(
  "/weekly",
  getWeeklyAnalytics
);

router.get("/daily", getDailyAnalytics);


module.exports = router;