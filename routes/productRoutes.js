const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");

// GET ALL PRODUCTS + SEARCH
router.get("/", getProducts);

// GET SINGLE PRODUCT
router.get("/:id", getProduct);

// CREATE PRODUCT
router.post("/", protect, admin, createProduct);

// UPDATE PRODUCT
router.put("/:id", protect, admin, updateProduct);

// DELETE PRODUCT
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;