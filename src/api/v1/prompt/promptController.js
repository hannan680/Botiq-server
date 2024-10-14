const Location = require("../../../infrastructure/database/models/location.model");
const GHLAuth = require("../../../core/domain/entities/ghlAuth.entity");
const GHLCustomValue = require("../../../core/domain/entities/ghlCustomValue.entity");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");
const GeneratedPrompt = require("../../../infrastructure/database/models/generatedPrompt.model");

const ghlAuth = new GHLAuth(Location);
const ghlCustomValue = new GHLCustomValue(ghlAuth);

exports.getGeneratedPrompt = catchAsync(async (req, res) => {
  const { locationId } = req.params;

  // Validate the locationId
  if (!locationId) {
    throw new AppError("Location ID is required", 400);
  }

  // Find the generated prompt by locationId
  const generatedPrompt = await GeneratedPrompt.findOne({
    locationId,
  }).populate("aiEmployee");

  // If not found, return an error
  if (!generatedPrompt) {
    return res.status(404).json({
      status: "fail",
      message: "Generated prompt not found for the provided location ID",
    });
  }

  // Respond with the generated prompt data
  res.status(200).json({
    status: "success",
    data: {
      generatedPrompt,
    },
  });
});

exports.savePrompt = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  console.log(locationId);
  const { employeeId, answers, prompt, customFields } = req.body;

  // Validate locationId and required fields
  if (!locationId || !employeeId || !prompt || !customFields) {
    throw new AppError(
      "Location ID, employeeId, generated prompt, prompt, and custom fields are required",
      400
    );
  }
  const generatedPrompt = generatePrompt(prompt, customFields, answers);

  // Manage custom value in GHL
  await ghlCustomValue.updateOrCreate(
    locationId,
    "OpenAi Prompt",
    generatedPrompt
  );
  // Check if a document with this locationId already exists
  let promptRecord = await GeneratedPrompt.findOne({ locationId });

  if (promptRecord) {
    // If exists, update the document
    promptRecord.aiEmployee = employeeId;
    promptRecord.answers = answers;
    promptRecord.generatedPrompt = generatedPrompt;
    promptRecord.prompt = prompt;
    promptRecord.customFields = customFields;
  } else {
    // If doesn't exist, create a new document
    promptRecord = new GeneratedPrompt({
      locationId,
      aiEmployee: employeeId,
      answers,
      generatedPrompt,
      prompt,
      customFields,
    });
  }

  // Save the document to the database
  await promptRecord.save();
  console.log(
    "Stored aiEmployee, answers, generatedPrompt, and customFields in the GeneratedPrompt model"
  );

  res.status(200).json({
    status: "success",
    message:
      "Generated prompt saved to GHL custom value and data saved to GeneratedPrompt model successfully",
  });
});

const generatePrompt = (prompt, customFields, answers) => {
  let updatedPrompt = prompt;

  customFields.forEach((field, index) => {
    const placeholder = `{{${field}}}`;
    updatedPrompt = updatedPrompt.replace(
      new RegExp(placeholder, "g"),
      answers[index]
    );
  });

  return updatedPrompt;
};
