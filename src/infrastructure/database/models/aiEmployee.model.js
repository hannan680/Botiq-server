const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aiEmployeeSchema = new Schema({
  role: {
    type: String,
    required: true,
  },
  aiName: {
    type: String,
    required: true,
  },
  industryName: {
    type: String,
    required: true,
  },
  mainPrompt: {
    type: String,
    required: true,
  },
  customFields: [
    {
      type: String,
    },
  ],
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiCategory",
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

aiEmployeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const AiEmployee = mongoose.model("AiEmployee", aiEmployeeSchema);
module.exports = AiEmployee;
