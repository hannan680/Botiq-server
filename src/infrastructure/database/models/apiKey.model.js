const mongoose = require("mongoose");
const { Schema } = mongoose;

const apiKeySchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ["CLAUDE", "OPENAI"],
    },
    encryptedKey: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
      required: true,
      index: true,
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

apiKeySchema.index({ locationId: 1, provider: 1 });

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

module.exports = ApiKey;
