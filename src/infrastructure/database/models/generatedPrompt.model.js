const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generatedPromptSchema = new Schema({
  locationId: {
    type: String,
    required: true,
    unique: true,
  },
  aiEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiEmployee",
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  generatedPrompt: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  customFields: {
    type: [String],
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

generatedPromptSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const GeneratedPrompt = mongoose.model(
  "GeneratedPrompt",
  generatedPromptSchema
);
module.exports = GeneratedPrompt;
