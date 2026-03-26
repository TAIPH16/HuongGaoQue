const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    image: String,

    benefits: String,

    quantity: Number,

    listedPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Promotion",
  promotionSchema
);