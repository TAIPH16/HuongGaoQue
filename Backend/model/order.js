
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    product_name: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    // Tong hang
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    final_price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",     // chờ thanh toán
        "paid",        // đã thanh toán
        "processing",  // đang xử lý
        "shipping",    // đang giao
        "completed",   // hoàn tất
        "cancelled",   // đã hủy
        "Chờ xác nhận",
        "Đã thanh toán",
        "Đã hủy",
        "Hoàn hàng",
        "Đang chờ",
        "WaitingPayment",  // Chờ thanh toán online
        "WaitingConfirm",   // Chờ xác nhận
        "Pending",          // Đang chờ xử lý
        "Cancelled"         // Đã hủy (tiếng Anh)
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "vnpay", "Payment cash", "Payment VNPay"],
      default: "cash",
    },
    payment_method: {
      type: String,
      enum: ["cash", "vnpay"],
      default: "cash",
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "Đã trả tiền"],
      default: "unpaid",
    },
    shipping_address: {
      name: String,
      email: String,
      phone: String,
      country: String,
      province: String,
      district: String,
      ward: String,
      address: String,
    },
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      country: String,
      province: String,
      district: String,
      ward: String,
      address: String,
      location: String,
      fullAddress: String,
    },
    billingAddress: {
      name: String,
      email: String,
      phone: String,
      country: String,
      province: String,
      district: String,
      ward: String,
      address: String,
      location: String,
      fullAddress: String,
    },
    contactInfo: {
      email: String,
      phoneNumber: String,
    },
    purchaseHistory: {
      orderDate: Date,
      deliveryDate: Date,
      returnDate: Date,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    cancelledReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ created_at: -1 });

orderSchema.pre("validate", function (next) {
  if (this.items && this.items.length > 0) {
    this.items = this.items.map((i) => ({
      ...i,
      subtotal: i.subtotal || ((i.unitPrice || i.price) * i.quantity) - (i.discountAmount || 0),
    }));

    // tổng tiền hàng
    this.subtotal = this.items.reduce((sum, i) => sum + (i.subtotal || 0), 0);

    // tổng cuối cùng
    const discount = this.discountAmount || this.discount_amount || 0;
    const shipping = this.shippingFee || this.shipping_fee || 0;
    // Đảm bảo giảm giá không vượt quá subtotal và tổng không âm
    const maxDiscount = Math.min(discount, this.subtotal);
    this.total = Math.max(0, this.subtotal - maxDiscount + shipping);
    this.final_price = this.total;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
