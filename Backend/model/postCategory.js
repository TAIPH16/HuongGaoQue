const mongoose = require('mongoose');

const postCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    postCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

postCategorySchema.pre('save', function(next) {
        this.updatedAt = Date.now();
    
});

module.exports = mongoose.model('PostCategory', postCategorySchema);

