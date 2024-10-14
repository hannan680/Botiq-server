const ApiKey = require("../../../infrastructure/database/models/apiKey.model");
const { encrypt, decrypt } = require("../../../core/utils/encryption");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");
const { decryptSSOData } = require("../../../core/utils/decryptSSO"); // Assuming this exists

exports.storeApiKey = catchAsync(async (req, res) => {
  const { provider, apiKey } = req.body;
  const ssoKey = req.headers.authorization?.split(" ")[1];

  if (!ssoKey) {
    throw new AppError("Authorization required", 401);
  }

  // Decrypt SSO data
  const locationData = decryptSSOData(ssoKey);

  const {
    activeLocation: locationId,
    companyId,
    userId,
    type: userType,
    role,
  } = locationData;

  // Optional: Check if user has permission to store API keys
  if (role !== "admin") {
    throw new AppError("Only admins can manage API keys", 403);
  }

  // Encrypt the API key
  const encryptedKey = encrypt(apiKey);

  // Find existing API key by locationId and provider, or create a new one if not found
  const updatedApiKey = await ApiKey.findOneAndUpdate(
    { locationId, provider },
    {
      provider,
      encryptedKey,
      userId,
      locationId,
      companyId,
      userType,
    },
    {
      new: true, // Return the updated document
      upsert: true, // Create a new document if it doesn't exist
      setDefaultsOnInsert: true, // Set default values if a new document is created
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      id: updatedApiKey._id,
      provider: updatedApiKey.provider,
      locationId: updatedApiKey.locationId,
      companyId: updatedApiKey.companyId,
    },
  });
});

exports.getApiKeys = catchAsync(async (req, res) => {
  const ssoKey = req.headers.authorization?.split(" ")[1];

  if (!ssoKey) {
    throw new AppError("Authorization required", 401);
  }

  const locationData = decryptSSOData(ssoKey);

  const { activeLocation: locationId, companyId, userId, role } = locationData;

  const query = { locationId };

  // If not admin, only show user's own keys
  if (role !== "admin") {
    query.userId = userId;
  }

  const apiKeys = await ApiKey.find(query);

  const sanitizedApiKeys = apiKeys.map((key) => ({
    id: key._id,
    provider: key.provider,
    locationId: key.locationId,
    companyId: key.companyId,
    isActive: key.isActive,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  }));

  res.status(200).json({
    status: "success",
    data: sanitizedApiKeys,
  });
});

exports.updateApiKey = catchAsync(async (req, res, next) => {
  const { apiKey, isActive } = req.body;
  const ssoKey = req.headers.authorization?.split(" ")[1];

  if (!ssoKey) {
    throw new AppError("Authorization required", 401);
  }

  const locationData = decryptSSOData(ssoKey);

  const { activeLocation: locationId, userId, role } = locationData;

  const existingKey = await ApiKey.findById(req.params.id);

  if (!existingKey) {
    return next(new AppError("API Key not found", 404));
  }

  // Check if user has permission to update this key
  if (role !== "admin" && existingKey.userId !== userId) {
    return next(
      new AppError("You do not have permission to update this API key", 403)
    );
  }

  const updateData = {};
  if (apiKey) updateData.encryptedKey = encrypt(apiKey);
  if (typeof isActive === "boolean") updateData.isActive = isActive;

  const updatedApiKey = await ApiKey.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      id: updatedApiKey._id,
      provider: updatedApiKey.provider,
      locationId: updatedApiKey.locationId,
      companyId: updatedApiKey.companyId,
      isActive: updatedApiKey.isActive,
    },
  });
});

exports.deleteApiKey = catchAsync(async (req, res, next) => {
  const ssoKey = req.headers.authorization?.split(" ")[1];

  if (!ssoKey) {
    throw new AppError("Authorization required", 401);
  }

  const locationData = decryptSSOData(ssoKey);

  const { userId, role } = locationData;

  const apiKey = await ApiKey.findById(req.params.id);

  if (!apiKey) {
    return next(new AppError("API Key not found", 404));
  }

  // Check if user has permission to delete this key
  if (role !== "admin" && apiKey.userId !== userId) {
    return next(
      new AppError("You do not have permission to delete this API key", 403)
    );
  }

  await ApiKey.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "API Key deleted successfully",
  });
});
