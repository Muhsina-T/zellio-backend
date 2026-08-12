const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const {
  getOrders,
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updatePayment,
} = require("../controllers/orderController");


// =============================
// CUSTOMER ORDERS
// =============================

// Get logged-in user's orders
router.get("/", getOrders);


// =============================
// ADMIN ORDERS
// =============================

// Get all orders for admin analytics
router.get("/admin/all", getAllOrders);


// =============================
// SINGLE ORDER
// =============================

// Get single order
router.get("/:id", getOrder);


// =============================
// CREATE ORDER
// =============================

router.post("/", createOrder);


// =============================
// UPDATE ORDER
// =============================

router.put("/:id", updateOrderStatus);


// =============================
// DELETE ORDER
// =============================

router.delete("/:id", deleteOrder);


// =============================
// UPDATE PAYMENT
// =============================

router.put("/:id/payment", updatePayment);


module.exports = router;