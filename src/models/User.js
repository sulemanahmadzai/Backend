// models/User.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentMethodSchema = new Schema({
  type: { type: String, required: true },
  details: { type: Schema.Types.Mixed, required: true },
});

const PersonalDetailsSchema = new Schema({
  phoneNumber: String,
  country: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
});

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: {
      type: String,
      enum: ["customer", "manager", "admin"],
      default: "admin",
    },

    personalDetails: PersonalDetailsSchema,
    paymentMethods: [PaymentMethodSchema],
    accountStatus: {
      type: String,
      enum: ["active", "deactivated", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
