const express = require("express");

const router = express.Router();

const Product = require("../models/Product");

// GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const products = await Product.find();

  res.json(products);
});

// GET SINGLE PRODUCT

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.json(product);
});

// CREATE PRODUCT ADMIN

router.post("/", async (req, res) => {
  const product = await Product.create(req.body);

  res.json(product);
});

// DELETE PRODUCT

router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);

  res.json({
    message: "Product deleted",
  });
});

module.exports = router;
