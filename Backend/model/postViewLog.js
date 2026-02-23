const mongoose = require('mongoose');

const postViewLogSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

postViewLogSchema.index({ viewedAt: 1 });
postViewLogSchema.index({ postId: 1, viewedAt: 1 });

module.exports = mongoose.model('PostViewLog', postViewLogSchema);
