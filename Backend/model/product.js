const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema({
    indexName: {
        type: String,
        required: true
    },
    value: {
        type: String
    },
    type: {
        type: String,
        enum: ['input', 'select'],
        default: 'input'
    },
    options: [String] // Cho loại select
}, { _id: true });

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    listedPrice: {
        type: Number,
        required: true
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    description: {
        type: String,
        default: ""
    },
    images: [{
        type: String // URLs hoặc paths của ảnh
    }],
    initialQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    remainingQuantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'tấn', 'tạ', 'yến'],
        default: 'kg'
    },
    status: {
        type: String,
        enum: ['Còn hàng', 'Hết hàng', 'Đang tính'],
        default: 'Còn hàng'
    },
    details: [productDetailSchema], // Chi tiết sản phẩm (loại hạt, độ ẩm, protein, etc.)
    soldQuantity: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    growth: {
        type: Number,
        default: 0
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null means admin-created product
    },
    is_approved: {
        type: Boolean,
        default: true // Admin products auto-approved, seller products need approval
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// // Middleware để tự động cập nhật updatedAt
// productSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

// Method để tính giá sau giảm
productSchema.virtual('discountedPrice').get(function () {
    return this.listedPrice * (1 - this.discountPercent / 100);
});

// Method để tự động cập nhật status dựa trên remainingQuantity
productSchema.methods.updateStatus = function () {
    if (this.remainingQuantity > 0) {
        this.status = 'Còn hàng';
    } else {
        this.status = 'Hết hàng';
    }
};

module.exports = mongoose.model('Product', productSchema);