const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const getAuthUserId = (req) => {
  return req.user._id.toString();
};

// GET ALL ORDERS OF A USER
const getOrders = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Please log in to view your orders" });
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
      return res.status(401).json({ message: "Please log in to place an order" });
    }

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (rawItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const items = rawItems.map((item) => ({
      product:
        item.product?._id || item.product?.id || item.product,
      quantity: item.quantity || 1,
    }));

    const orderDate = req.body.date || new Date().toISOString();

  const order = await Order.create({
  ...req.body,

  items,

  user: userId,

  date: orderDate,

  payment: {
    method: typeof req.body.payment === "string" 
      ? (req.body.payment === "COD" ? "Cash on Delivery" : req.body.payment)
      : (req.body.payment?.method || "Cash on Delivery"),

    status: (typeof req.body.payment === "string" && (req.body.payment === "Card" || req.body.payment === "Razorpay"))
      ? "Paid"
      : (req.body.payment?.method === "Razorpay" || req.body.payment?.method === "Card" ? "Paid" : "Pending"),

    razorpayOrderId: req.body.payment?.razorpayOrderId,
    razorpayPaymentId: req.body.payment?.razorpayPaymentId,
    razorpaySignature: req.body.payment?.razorpaySignature,
  },
});



// Reduce product stock
for (const item of items) {

  const product = await Product.findById(item.product);

  if (product) {

    product.stock = Math.max(
      0,
      (product.stock || 0) - item.quantity
    );

    await product.save();
  }
}


// Clear cart after order creation
await Cart.findOneAndUpdate(
  { user: userId },
  { items: [] },
  {
    returnDocument: "after",
    upsert: true,
  }
);

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product"
    );

    res.status(201).json(populatedOrder);
  } catch (error) {
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

    if (
      order.user.toString() !== userId &&
      req.user?.role !== "admin"
    ) {
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
      }
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
      return res.status(401).json({ message: "Please log in to view this order" });
    }

    const order = await Order.findById(req.params.id).populate(
      "items.product"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own orders" });
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
      return res.status(401).json({ message: "Please log in to delete orders" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own orders" });
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
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updatePayment,
};