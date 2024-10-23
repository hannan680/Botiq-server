const { decryptSSOData } = require("../utils/decryptSSO");
const { AppError, catchAsync } = require("../utils/errorHandler");

exports.ssoDecryption = catchAsync(async (req, res, next) => {
  const { ssoKey } = req.body;

  if (!ssoKey) {
    return next(new AppError("Please send a valid key", 400));
  }

  try {
    const data = decryptSSOData(ssoKey);

    if (!data) {
      return next(new AppError("UNAUTHORIZED", 401));
    }

    req.locationData = data;
    next();
  } catch (err) {
    return next(new AppError("Decryption failed", 500));
  }
});
