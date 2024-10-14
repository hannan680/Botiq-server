// aiEmployeeController.js

const AiEmployee = require("../../../infrastructure/database/models/aiEmployee.model");
const ApiFeatures = require("../../../core/utils/ApiFeatures");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");
const AiCategory = require("../../../infrastructure/database/models/aiCategory.model");

exports.createAiEmployee = catchAsync(async (req, res, next) => {
  const {
    aiName,
    industryName,
    mainPrompt,
    customFields,
    status,
    categoryId, // Include category field
    role, // Include role field
  } = req.body;

  const image = req.body.imageUrl || null;

  // console.log(JSON.parse(customFields));
  // Check if the category exists
  const existingCategory = await AiCategory.findById(categoryId);
  if (!existingCategory) {
    return next(new AppError("Category not found", 404));
  }

  // Create new AI employee
  const newAiEmployee = new AiEmployee({
    aiName,
    industryName,
    mainPrompt,
    customFields: JSON.parse(customFields),
    image,
    status,
    category: categoryId, // Include category field
    role, // Include role field
  });

  const savedAiEmployee = await newAiEmployee.save();

  res.status(201).json({
    status: "success",
    data: savedAiEmployee,
  });
});

exports.getAllAiEmployees = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(req.query, AiEmployee.find())
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const aiEmployees = await features.queryDB;
  const totalCount = await AiEmployee.countDocuments(
    features.queryDB._conditions
  );

  res.status(200).json({
    status: "success",
    results: aiEmployees.length,
    totalCount,
    data: aiEmployees,
  });
});

exports.getDraftEmployees = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    req.query,
    AiEmployee.find({ status: "draft" })
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const draftEmployees = await features.queryDB;
  const totalCount = await AiEmployee.countDocuments({
    status: "draft",
    ...features.queryDB._conditions,
  });

  res.status(200).json({
    status: "success",
    results: draftEmployees.length,
    totalCount,
    data: draftEmployees,
  });
});

exports.getPublishedEmployees = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    req.query,
    AiEmployee.find({ status: "published" })
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const publishedEmployees = await features.queryDB;
  const totalCount = await AiEmployee.countDocuments({
    status: "published",
    ...features.queryDB._conditions,
  });

  res.status(200).json({
    status: "success",
    results: publishedEmployees.length,
    totalCount,
    data: publishedEmployees,
  });
});

exports.getAiEmployeeById = catchAsync(async (req, res, next) => {
  const aiEmployee = await AiEmployee.findById(req.params.id);
  console.log(aiEmployee);
  if (!aiEmployee) {
    return next(new AppError("AI Employee not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: aiEmployee,
  });
});

exports.getAiEmployeesByCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  // Modify the query to filter by both categoryId and status: "published"
  const features = new ApiFeatures(
    req.query,
    AiEmployee.find({ category: categoryId, status: "published" })
  )
    .filter()
    .sort()
    .limitFields()
    .pagination();

  // Execute the query
  const aiEmployees = await features.queryDB;

  // Get total count based on the same conditions (category and status)
  const totalCount = await AiEmployee.countDocuments({
    category: categoryId,
    status: "published",
    ...features.queryDB._conditions,
  });

  // Respond with the results
  res.status(200).json({
    status: "success",
    results: aiEmployees.length,
    totalCount,
    data: aiEmployees,
  });
});

exports.updateAiEmployee = catchAsync(async (req, res, next) => {
  const { categoryId, customFields, ...updateData } = req.body; // No separate destructuring for role
  if (req.body.imageUrl) {
    updateData.image = req.body.imageUrl;
  }
  console.log(customFields, "Custom Fields", updateData);
  const updatedAiEmployee = await AiEmployee.findById(req.params.id);

  if (!updatedAiEmployee) {
    return next(new AppError("AI Employee not found", 404));
  }

  // Check if the category exists (only if updating category)
  if (categoryId) {
    const existingCategory = await AiCategory.findById(categoryId);
    if (!existingCategory) {
      return next(new AppError("Category not found", 404));
    }
    updatedAiEmployee.category = categoryId;
  }

  // Update the rest of the fields (including role)
  Object.assign(updatedAiEmployee, updateData);
  if (customFields) {
    updatedAiEmployee.customFields = JSON.parse(customFields);
  }

  await updatedAiEmployee.save();

  res.status(200).json({
    status: "success",
    data: updatedAiEmployee,
  });
});

exports.deleteAiEmployee = catchAsync(async (req, res, next) => {
  const deletedAiEmployee = await AiEmployee.findByIdAndDelete(req.params.id);

  if (!deletedAiEmployee) {
    return next(new AppError("AI Employee not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "AI Employee deleted successfully",
  });
});
