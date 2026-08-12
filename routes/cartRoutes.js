const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// GET CART
router.get("/", getCart);

// ADD PRODUCT
router.post("/", addToCart);

// UPDATE QUANTITY
router.put("/:itemId", updateCart);

// CLEAR CART
router.delete("/clear", clearCart);

// REMOVE PRODUCT
router.delete("/:itemId", removeFromCart);

module.exports = router;