const mongoose = require("mongoose");
const Return = require("../models/Return");
const Order = require("../models/Order");
const Product = require("../models/Product");

const getAuthUserId = (req) => {
  if (!req.user) return null;
  return req.user._id?.toString() || req.user.id?.toString() || null;
};

// Get all returns
const getReturns = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to view your returns" });
    }

    const query = req.user?.role === "admin" ? {} : { user: userId };

    const returns = await Return.find(query)
      .populate("user")
      .populate("product")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get returns of one user
const getUserReturns = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to view your returns" });
    }

    const returns = await Return.find({
      user: userId,
    })
      .populate("product")
      .populate("order");

    res.json(returns);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create return request
const createReturn = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to request a return" });
    }

    const { order, product, reason } = req.body;

    if (!order || !product || !reason) {
      return res
        .status(400)
        .json({ message: "Order, product, and reason are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(order)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const existingOrder = await Order.findById(order);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const created = await Return.create({
      order,
      product,
      reason,
      user: userId,
    });

    const populated = await Return.findById(created._id)
      .populate("user")
      .populate("product")
      .populate("order");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update return status
const updateReturnStatus = async (req, res) => {
  try {
    const updated = await Return.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        returnDocument: "after",
      },
    )
      .populate("user")
      .populate("product")
      .populate("order");

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getReturns,
  getUserReturns,
  createReturn,
  updateReturnStatus,
};
