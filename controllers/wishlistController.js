const Wishlist = require("../models/Wishlist");

const getAuthUserId = (req) => {
  if (!req.user) return null;
  return req.user._id?.toString() || req.user.id?.toString() || null;
};

// GET WISHLIST
const getWishlist = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please log in to view your wishlist" });
    }

    let wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [],
      });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADD PRODUCT
const addToWishlist = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please log in to update your wishlist" });
    }

    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [],
      });
    }

    const exists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      wishlist.products.push(productId);
    }

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate("products");

    res.status(200).json(updatedWishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REMOVE PRODUCT
const removeFromWishlist = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please log in to remove items from wishlist" });
    }

    const productId = req.params.productId;

    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate("products");

    res.status(200).json(updatedWishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};