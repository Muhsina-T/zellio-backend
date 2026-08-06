const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const {
  getReturns,
  getUserReturns,
  createReturn,
  updateReturnStatus,
} = require("../controllers/returnController");

router.get("/", getReturns);

router.get("/user/:userId", getUserReturns);

router.post("/", createReturn);

router.put("/:id", updateReturnStatus);

module.exports = router;