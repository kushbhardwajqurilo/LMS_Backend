const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema(
  {
    time: {
      type: Number,
      default: 0,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false, timestamps: true },
);

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "student id required"],
      ref: "User",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "course required"],
      ref: "course",
    },

    progress: {
      type: Map,
      of: lectureProgressSchema, //  dynamic keys (lectureId)
      default: {},
    },
  },
  { timestamps: true },
);

const progressModel = mongoose.model("Progress", progressSchema);
module.exports = progressModel;
