const express = require("express");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", createOrder);

// Verify Payment Signature
router.post("/verify", verifyPayment);

module.exports = router;