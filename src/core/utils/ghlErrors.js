class GHLError extends Error {
  constructor(message, statusCode = 500, errorCode = "GHL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class GHLAuthError extends GHLError {
  constructor(message) {
    super(message, 401, "GHL_AUTH_ERROR");
  }
}

class GHLResourceNotFoundError extends GHLError {
  constructor(resourceType) {
    super(`${resourceType} not found`, 404, "GHL_RESOURCE_NOT_FOUND");
  }
}

class GHLTokenRefreshError extends GHLError {
  constructor(message = "Failed to refresh access token") {
    super(message, 401, "GHL_TOKEN_REFRESH_ERROR");
  }
}

module.exports = {
  GHLError,
  GHLAuthError,
  GHLResourceNotFoundError,
  GHLTokenRefreshError,
};
