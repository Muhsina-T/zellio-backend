const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// Seed default admin
const seedDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@zellio.com",
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        name: "Admin",
        email: "admin@zellio.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Default admin created");
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();

      console.log("✅ Admin role updated");
    }
  } catch (err) {
    console.error("❌ Admin seed error:", err.message);
  }
};

// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/returns", require("./routes/returnRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

app.get("/", (req, res) => {
  res.send("Zellio Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });