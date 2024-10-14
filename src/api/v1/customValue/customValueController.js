const Company = require("../../../infrastructure/database/models/company.model");
const Location = require("../../../infrastructure/database/models/location.model");
const GHLAuth = require("../../../core/domain/entities/ghlAuth.entity");
const GHLCustomValue = require("../../../core/domain/entities/ghlCustomValue.entity");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");

const ghlAuth = new GHLAuth(Location);
const ghlCustomValue = new GHLCustomValue(ghlAuth);

exports.getCustomValues = catchAsync(async (req, res) => {
  const { locationId } = req.query;

  // Validate locationId
  if (!locationId) {
    throw new AppError("Location ID is required", 400);
  }

  const customValues = await ghlCustomValue.getCustomValues(locationId);
  res.status(200).json({
    status: "success",
    data: customValues,
  });
});

exports.updateCustomValue = catchAsync(async (req, res) => {
  const { locationId, id } = req.params;
  const { name, value } = req.body;

  // Validate inputs
  if (!name || !value) {
    throw new AppError("Name and value are required", 400);
  }

  const updatedValue = await ghlCustomValue.updateCustomValue(
    locationId,
    id,
    name,
    value
  );
  console.log("Updated Custom Value:", updatedValue);
  res.status(200).json({
    status: "success",
    data: updatedValue,
  });
});

exports.createCustomValue = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const { name, value } = req.body;

  // Validate inputs
  if (!name || !value) {
    throw new AppError("Name and value are required.", 400);
  }

  const createdValue = await ghlCustomValue.createCustomValue(
    locationId,
    name,
    value
  );
  console.log("Created Custom Value:", createdValue);
  res.status(201).json({
    status: "success",
    data: createdValue,
  });
});

exports.createOrUpdateCustomValue = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const { name, value } = req.body;

  const data = await ghlCustomValue.updateOrCreate(locationId, name, value);
  res.status(200).json({
    status: "success",
    data: data,
  });
});

exports.manageCustomValue = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const { industryId, userAnswers, value: generatedPrompt, name } = req.body;

  // Validate locationId and required fields
  if (!locationId || !name || !generatedPrompt) {
    throw new AppError(
      "Location ID, name, and generated prompt are required",
      400
    );
  }

  // Manage custom value in GHL
  await ghlCustomValue.updateOrCreate(locationId, name, generatedPrompt);

  // Save data to MongoDB
  const company = await Company.findOne({ locationId });
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  company.industryId = industryId;
  company.answers = userAnswers;
  company.generatedPrompt = generatedPrompt;

  await company.save();
  console.log(
    "Stored industryId, userAnswers, and generatedPrompt in the Company model"
  );

  res.status(200).json({
    status: "success",
    message:
      "Generated prompt saved to GHL custom value and data saved to MongoDB successfully",
  });
});
