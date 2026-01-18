require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/rice";
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("🌟🔮 MongoDB Ready to Serve 🍀⚡");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB", err);
  });

// Models - Load all models to register them with Mongoose
require("./model/user");
require("./model/product");
require("./model/category");
require("./model/order");
require("./model/post");
require("./model/postCategory");
require("./model/notification");
require("./model/tokenblacklist");
require("./model/cart");
require("./model/cartItem");
require("./model/wishlist");
require("./model/wishlistGroup");
require("./model/contact");
require("./model/membership");

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middlewares
app.use(logger("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API Routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth.routes.js");
const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const ordersRouter = require("./routes/orders");
const postsRouter = require("./routes/posts");
const postCategoriesRouter = require("./routes/postCategories");
const usersRouter = require("./routes/users");
const publicRouter = require("./routes/public");
const profileRouter = require("./routes/profile");
const notificationsRouter = require("./routes/notification");
const accountManagementRouter = require("./routes/accountManagement.routes");
const cartRouter = require("./routes/cart.routes");
const wishlistRouter = require("./routes/wishlist.routes");
const membershipRouter = require("./routes/membership.routes");
const contactRouter = require("./routes/contact.routes");
const customerOrdersRouter = require("./routes/customerOrders");
const vnpayRouter = require("./routes/vnpay.routes");
const sellersRouter = require("./routes/sellers");
const sellerAuthRouter = require("./routes/sellerAuth.routes");
const sellerProductsRouter = require("./routes/sellerProducts.routes");
const sellerOrdersRouter = require("./routes/sellerOrders.routes");
const sellerStockRouter = require("./routes/sellerStock.routes");
const unifiedAuthRouter = require("./routes/unifiedAuth.routes");

// Register routes
app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter); // Public routes (no auth required)
app.use("/api/profile", profileRouter); // Profile self-update routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/customer/orders", customerOrdersRouter);
app.use("/api/vnpay", vnpayRouter);
app.use("/api/posts", postsRouter);
app.use("/api/post-categories", postCategoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/customers", usersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/contacts", contactRouter);

app.use("/api/account-management", accountManagementRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/sellers", sellersRouter);

// Seller routes
app.use("/api/seller/auth", sellerAuthRouter);
app.use("/api/seller/products", sellerProductsRouter);
app.use("/api/seller/orders", sellerOrdersRouter);
app.use("/api/seller/stock", sellerStockRouter);

// UNIFIED LOGIN - Chung cho tất cả
app.use("/api/unified/auth", unifiedAuthRouter);
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Catch 404
app.use(function (req, res, next) {
  next(createError(404, "Route not found"));
});

// Error handler
app.use(function (err, req, res, next) {
  // Log error
  console.error("Error:", err);

  // Set locals, only providing error in development
  const isDevelopment = req.app.get("env") === "development";

  // If it's an API route, return JSON
  if (req.path.startsWith("/api")) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
      error: isDevelopment ? err.stack : undefined
    });
  }

  // Otherwise render error page
  res.locals.message = err.message;
  res.locals.error = isDevelopment ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
