const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

// GET USER WISHLIST
router.get("/:userId", getWishlist);

// ADD PRODUCT
router.post("/", addToWishlist);

// REMOVE PRODUCT
router.delete("/:productId", removeFromWishlist);

module.exports = router;