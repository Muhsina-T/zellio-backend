const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");


// Get logged-in user's orders
router.get("/", getOrders);


// Get single order
router.get("/:id", getOrder);


// Create order
router.post("/", createOrder);


// Update order status
router.put("/:id", updateOrderStatus);


// Delete order
router.delete("/:id", deleteOrder);


module.exports = router;