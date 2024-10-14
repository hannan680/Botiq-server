const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    access_token: {
      type: String,
      required: true,
    },
    token_type: {
      type: String,
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
    },
    locationId: {
      type: String,
      index: true, // Add index for faster lookups
    },
    companyId: {
      type: String,
      required: true,
      index: true, // Add index for faster lookups
    },
    approvedLocations: {
      type: [String],
      default: [], // Default to empty array
    },
    userId: {
      type: String,
    },
    planId: {
      type: String,
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);

module.exports = Company;
