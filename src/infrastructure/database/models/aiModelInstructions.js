const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aiModalInstructionsSchema = new Schema({
  assistantId: {
    type: String,
  },
  modelName: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field before saving
aiModalInstructionsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const AiModalInstructions = mongoose.model(
  "AiModalInstructions",
  aiModalInstructionsSchema
);
module.exports = AiModalInstructions;
