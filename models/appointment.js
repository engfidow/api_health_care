const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    date: Date,
    reason: String,
    phone: String,
    appointmentprice: String,
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }
  },
  {
    timestamps: true // ✅ Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
