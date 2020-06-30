const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    description: {
      required: true,
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      //Relation btween two models by using ref
      ref: "User", //!Model should be same as in the user model else it won't work
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
