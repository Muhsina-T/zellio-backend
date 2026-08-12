const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const getAuthUserId = (req) => {
  return req.user._id.toString();
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
   
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL ORDERS OF A USER
const getOrders = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to view your orders" });
    }

    const query = req.user?.role === "admin" ? {} : { user: userId };

    const orders = await Order.find(query)
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Please log in to place an order",
      });
    }

    const rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : [];

    if (rawItems.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    const items = [];
    const productsToUpdate = [];

    // -----------------------------
    // 1. VALIDATE ALL PRODUCTS FIRST
    // -----------------------------

    for (const item of rawItems) {
      const productId =
        item.product?._id ||
        item.product?.id ||
        item.product;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Completely out of stock
      if ((product.stock || 0) <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      const variant = product.variants?.find(
        (v) => v.id === Number(item.variantId)
      );

      if (!variant) {
        return res.status(404).json({
          message: `Variant not found for ${product.name}`,
        });
      }

      const quantity = Number(item.quantity) || 1;

      // Not enough stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} ${product.name} available`,
        });
      }

      items.push({
        product: product._id,
        variantId: variant.id,
        storage: variant.storage,
        color: variant.color,
        costPrice: Number(variant.costPrice || 0),
        sellingPrice: Number(variant.price || product.price),
        quantity,
      });

      productsToUpdate.push({
        product,
        quantity,
      });
    }

    // -----------------------------
    // 2. REDUCE STOCK ONLY AFTER
    //    ALL PRODUCTS ARE VALID
    // -----------------------------

    for (const item of productsToUpdate) {
      item.product.stock -= item.quantity;

      await item.product.save();
    }

    // -----------------------------
    // 3. CREATE ORDER
    // -----------------------------

    const orderDate =
      req.body.date || new Date().toISOString();

    const order = await Order.create({
      user: userId,

      orderNumber: `ZEL-${Date.now()}`,

      items,

      address: req.body.address,

      total: req.body.total,

      date: orderDate,

      payment: {
        method:
          typeof req.body.payment === "string"
            ? req.body.payment === "COD"
              ? "Cash on Delivery"
              : req.body.payment
            : req.body.payment?.method ||
              "Cash on Delivery",

        status:
          typeof req.body.payment === "string" &&
          (
            req.body.payment === "Card" ||
            req.body.payment === "Razorpay"
          )
            ? "Paid"
            : req.body.payment?.method === "Razorpay" ||
              req.body.payment?.method === "Card"
              ? "Paid"
              : "Pending",

        razorpayOrderId:
          req.body.payment?.razorpayOrderId,

        razorpayPaymentId:
          req.body.payment?.razorpayPaymentId,

        razorpaySignature:
          req.body.payment?.razorpaySignature,
      },
    });

    // -----------------------------
    // 4. CLEAR CART
    // -----------------------------

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    // -----------------------------
    // 5. RETURN ORDER
    // -----------------------------

    const populatedOrder =
      await Order.findById(order._id)
        .populate("items.product");

    res.status(201).json(populatedOrder);

  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Please log in to update orders",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        message: "You can only update your own orders",
      });
    }

    const updatePayload = {
      status: req.body.status,
    };

    if (req.body.status === "Delivered") {
      updatePayload.deliveredDate = new Date().toISOString();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("items.product");

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE ORDER
const getOrder = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to view this order" });
    }

    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You can only view your own orders" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE ORDER
const deleteOrder = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please log in to delete orders" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You can only delete your own orders" });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PAYMENT DETAILS AFTER RAZORPAY SUCCESS
const updatePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.payment.method = "Razorpay";
    order.payment.status = "Paid";
    order.payment.razorpayOrderId = req.body.razorpayOrderId;
    order.payment.razorpayPaymentId = req.body.razorpayPaymentId;
    order.payment.razorpaySignature = req.body.razorpaySignature;

    await order.save();

    res.status(200).json({
      message: "Payment updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getOrders,
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updatePayment,
};
