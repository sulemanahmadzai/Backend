// models/SupportTicket.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ResponseSchema = new Schema(
  {
    staffUserId: { type: Schema.Types.ObjectId, ref: "User" }, // Manager or Admin
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
