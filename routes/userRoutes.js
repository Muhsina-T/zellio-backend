const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

// Get logged-in user
router.get("/me", protect, getMe);

// Profile endpoint for frontend AuthContext
router.get("/profile", protect, getMe);

module.exports = router;