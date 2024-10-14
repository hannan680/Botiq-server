// File: aiCategoryController.js

const AiCategory = require("../../../infrastructure/database/models/aiCategory.model");
const ApiFeatures = require("../../../core/utils/ApiFeatures");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");

exports.createAiCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  const newCategory = new AiCategory({
    name,
    description,
  });

  const savedCategory = await newCategory.save();

  res.status(201).json({
    status: "success",
    data: savedCategory,
  });
});

exports.getAllAiCategories = catchAsync(async (req, res) => {
  const features = new ApiFeatures(req.query, AiCategory.find())
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const categories = await features.queryDB;
  const totalCount = await AiCategory.countDocuments(
    features.queryDB._conditions
  );

  res.status(200).json({
    status: "success",
    results: categories.length,
    totalCount,
    data: categories,
  });
});

exports.getAiCategoryById = catchAsync(async (req, res, next) => {
  const category = await AiCategory.findById(req.params.id);

  if (!category) {
    return next(new AppError("AI Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});

exports.updateAiCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await AiCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    return next(new AppError("AI Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedCategory,
  });
});

exports.deleteAiCategory = catchAsync(async (req, res, next) => {
  const deletedCategory = await AiCategory.findByIdAndDelete(req.params.id);

  if (!deletedCategory) {
    return next(new AppError("AI Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "AI Category deleted successfully",
  });
});
