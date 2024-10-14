const Location = require("../../../infrastructure/database/models/location.model");
const { decryptSSOData } = require("../../../core/utils/decryptSSO");
const GHLAuth = require("../../../core/domain/entities/ghlAuth.entity");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");
const { encrypt } = require("../../../core/utils/encryption");

// Create an instance of GHLAuth
const ghlAuth = new GHLAuth(Location);

exports.install = catchAsync(async (req, res, next) => {
  const CLIENT_ID = process.env.GHL_APP_CLIENT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const SCOPE = process.env.GHL_APP_SCOPE;

  if (!CLIENT_ID || !REDIRECT_URI || !SCOPE) {
    throw new AppError("Missing required environment variables", 500);
  }

  const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=${SCOPE}`;

  res.redirect(authUrl);
});

exports.authorize = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError("Authorization code is required", 400);
  }

  const data = await ghlAuth.getTokens(code);
  const {
    locationId,
    companyId,
    access_token,
    refresh_token,
    scope,
    expires_in,
    userType,
  } = data;

  const updateData = {
    access_token,
    refresh_token,
    scope,
    expires_in,
    userType,
    companyId,
    locationId,
  };

  let updateResult;

  if (locationId) {
    updateResult = await Location.findOneAndUpdate({ locationId }, updateData, {
      new: true,
      upsert: true,
    });
  } else if (companyId) {
    updateResult = await Location.findOneAndUpdate({ companyId }, updateData, {
      new: true,
      upsert: true,
    });
  } else {
    throw new AppError("No locationId or companyId provided", 400);
  }

  res.send("Authorization successful and data saved.");
});

exports.authorizeLocation = catchAsync(async (req, res, next) => {
  const { companyId, locationId } = req.query;

  if (!companyId || !locationId) {
    throw new AppError("CompanyId and locationId are required", 400);
  }

  const data = await ghlAuth.getLocationAccessToken(companyId, locationId);

  const { access_token, refresh_token, scope, expires_in, userType } = data;

  const updateData = {
    access_token,
    refresh_token,
    scope,
    expires_in,
    userType,
    companyId,
    locationId,
  };

  const updatedLocation = await Location.findOneAndUpdate(
    { locationId },
    updateData,
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: "success",
    message: "Authorization successful and data saved.",
    data: updatedLocation,
  });
});

exports.decryptSSO = catchAsync(async (req, res, next) => {
  const { key } = req.body;

  if (!key) {
    throw new AppError("Please send a valid key", 400);
  }

  console.log(key, "Key");
  const data = decryptSSOData(key);
  if (!data) {
    throw new AppError("UNAUTHORIZED ", 401);
  }
  console.log(data, "Data");

  if (data.activeLocation) {
    const location = await Location.findOne({
      companyId: data.companyId,
      locationId: data.activeLocation,
    });

    console.log(location, "Location");

    if (!location) {
      await getAndUpdateLocationAccessToken(
        data.companyId,
        data.activeLocation
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: data,
  });
});

const getAndUpdateLocationAccessToken = async (companyId, locationId) => {
  const data = await ghlAuth.getLocationAccessToken(companyId, locationId);

  const { access_token, refresh_token, scope, expires_in, userType } = data;

  const updateData = {
    access_token,
    refresh_token,
    scope,
    expires_in,
    userType,
    companyId,
    locationId,
  };

  const updatedLocation = await Location.findOneAndUpdate(
    { locationId },
    updateData,
    { new: true, upsert: true }
  );

  return updatedLocation;
};
