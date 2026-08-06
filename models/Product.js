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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
