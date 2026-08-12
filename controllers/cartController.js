const Cart = require("../models/Cart");
const Product = require("../models/Product");
// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      productId,
      variantId,
      quantity,
    } = req.body;

    // Make sure variantId was provided
    if (variantId === undefined || variantId === null) {
      return res.status(400).json({
        message: "Variant ID is required",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check selected variant exists
    const variant = product.variants?.find(
      (v) => v.id === Number(variantId)
    );

    if (!variant) {
      return res.status(404).json({
        message: "Product variant not found",
      });
    }

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantId === Number(variantId)
    );

    const addQuantity = quantity || 1;

    if (itemIndex > -1) {
      // Same product + same variant
      cart.items[itemIndex].quantity += addQuantity;
    } else {
      // New product/variant combination
      cart.items.push({
        product: productId,
        variantId: Number(variantId),
        quantity: addQuantity,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(
      cart._id
    ).populate("items.product");

    res.status(201).json(updatedCart);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE CART QUANTITY
const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { action } = req.body;
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (action === "increase") {
      item.quantity++;
    } else if (action === "decrease") {
      if (item.quantity > 1) {
        item.quantity--;
      }
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate("items.product");

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

   const updatedCart = await Cart.findOneAndUpdate(
  { user: userId },
  { items: [] },
  { 
    returnDocument: "after",
    upsert: true
  }
).populate("items.product");

    res.json(updatedCart || { user: userId, items: [] });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
};