const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

   items: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: Number,
      required: true,
    },

    storage: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
],

    address: {
      name: String,
      phone: String,
      address: String,
    },


    // Change this section
    payment: {
      method: {
        type: String,
        default: "Cash on Delivery",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Failed",
        ],
        default: "Pending",
      },

      razorpayOrderId: {
        type: String,
      },

      razorpayPaymentId: {
        type: String,
      },

      razorpaySignature: {
        type: String,
      },
    },


    total: {
      type: Number,
      required: true,
    },

    canReturn: {
      type: Boolean,
      default: true,
    },

    deliveredDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);