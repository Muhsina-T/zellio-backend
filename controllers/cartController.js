const Cart = require("../models/Cart");

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
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

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
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not in cart",
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

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

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
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

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
      { new: true, upsert: true }
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