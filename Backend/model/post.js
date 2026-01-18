const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PostCategory',
        required: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: '',
        maxlength: 1000
    },
    publishType: {
        type: String,
        enum: ['now', 'scheduled'],
        default: 'now'
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    publishedAt: {
        type: Date,
        default: null
    },
    audience: {
        type: String,
        enum: ['Mọi người', 'Mọi người trên 18 tuổi'],
        default: 'Mọi người'
    },
    status: {
        type: String,
        enum: ['Đã tải lên', 'Đã lưu', 'Đã xóa'],
        default: 'Đã lưu'
    },
    viewCount: {
        type: Number,
        default: 0
    },
    lastSavedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

