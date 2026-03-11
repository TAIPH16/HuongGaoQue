/**
 * Bản ghi nhập kho (stock entry) — mỗi lần addStock tạo 1 bản ghi,
 * cho phép xóa bản ghi (trừ lại tồn theo số lượng còn khả dụng).
 */
const mongoose = require('mongoose');

const stockEntrySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAllocated: {
      type: Number,
      default: function () {
        return this.quantity;
      },
    },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    type: { type: String, enum: ['inbound', 'adjustment'], default: 'inbound' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

stockEntrySchema.index({ product: 1, created_at: -1 });

module.exports = mongoose.model('StockEntry', stockEntrySchema);
