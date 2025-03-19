// models/Product.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],

    tags: [String],
    attributes: { type: Schema.Types.Mixed }, // Key-value pairs
    images: [String], // URLs or paths to images

    status: {
      type: String,
      enum: ["available", "out_of_stock", "discontinued"],
      default: "available",
    
    },


  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
