const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    access_token: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
      required: true,
    },
    expires_in: {
      type: Number,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    locationId: {
      type: String,
      required: true,
      index: true, // Index for faster lookup
    },
    companyId: {
      type: String,
      required: true,
      index: true, // Index for faster lookup
    },
    approvedLocations: {
      type: [String],
      default: [], // Default to empty array
    },
    userId: {
      type: String,
      required: true,
    },
    industryId: {
      type: Schema.Types.ObjectId,
      ref: "Industry", // Reference to Industry model
    },
    answers: {
      type: [String], // Ensuring type is array of strings
      default: [], // Default to an empty array
    },
    generatedPrompt: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
