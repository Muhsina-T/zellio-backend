const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: String,

    category: String,

    // Keep this temporarily because your existing
    // frontend uses product.price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: String,

    images: [String],

    rating: Number,

    storage: String,

    color: String,

    description: String,

    stock: Number,

    variants: [
      {
        id: Number,

        storage: String,

        color: String,

        costPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        image: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);