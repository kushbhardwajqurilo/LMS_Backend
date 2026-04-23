// models/Scholarship.js
const mongoose = require("mongoose");

const ScholarshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "credited", "rejected"],
      default: "pending"
    },
    reason: {
      type: String,
      default: ""
    },
    adminNote: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const ScholarshipModel = mongoose.model("Scholarship", ScholarshipSchema);
module.exports = ScholarshipModel;
