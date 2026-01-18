const mongoose = require('mongoose');

const wishlistGroupSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    is_shared: { type: Boolean, default: false },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    share_token: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

wishlistGroupSchema.virtual('items', {
  ref: 'wishlist',
  localField: '_id',
  foreignField: 'group_id',
});

module.exports = mongoose.model('WishlistGroup', wishlistGroupSchema);

