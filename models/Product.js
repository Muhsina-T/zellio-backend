const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: String,

    category: String,

    price: Number,

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
        price: Number,
        image: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
