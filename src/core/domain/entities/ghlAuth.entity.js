const axios = require("axios");
const {
  GHLError,
  GHLAuthError,
  GHLResourceNotFoundError,
  GHLTokenRefreshError,
} = require("../../utils/ghlErrors");
const { decrypt, encrypt } = require("../../utils/encryption");

class GHLAuth {
  constructor(companyModel) {
    this.companyModel = companyModel;
    this.baseURL = process.env.GHL_API_DOMAIN;
    this.clientId = process.env.GHL_APP_CLIENT_ID;
    this.clientSecret = process.env.GHL_APP_CLIENT_SECRET;
    this.redirectUri = process.env.REDIRECT_URI;
  }

  async refreshAccessToken(resourceId) {
    try {
      const company = await this.companyModel.findOne({
        $or: [{ companyId: resourceId }, { locationId: resourceId }],
      });

      if (!company) {
        throw new GHLResourceNotFoundError("Company or Location");
      }
      console.log(company, "COmpany Refresh");
      // const refreshToken = company.refresh_token;
      const refreshToken = decrypt(company.refresh_token);

      console.log(refreshToken, "Decrypted Refresh Token");
      const userType = company.locationId ? "Location" : "Company";
      console.log(userType, "userType");
      const response = await axios.post(
        "https://services.leadconnectorhq.com/oauth/token",
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          user_type: userType,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // await this.companyModel.findOneAndUpdate(
      //   { _id: company._id },
      //   {
      //     access_token: response.data.access_token,
      //     refresh_token: response.data.refresh_token,
      //     expires_in: response.data.expires_in,
      //   }
      // );
      await this.companyModel.findOneAndUpdate(
        { _id: company._id },
        {
          access_token: encrypt(response.data.access_token),
          refresh_token: encrypt(response.data.refresh_token),
          expires_in: response.data.expires_in,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof GHLError) throw error;

      console.error("Error refreshing access token:", error);
      throw new GHLTokenRefreshError(error.message);
    }
  }

  createAxiosInstance(resourceId) {
    const axiosInstance = axios.create({
      baseURL: this.baseURL,
    });

    axiosInstance.interceptors.request.use(
      async (requestConfig) => {
        try {
          console.log("In Inteceptor resquest");
          // const accessToken = await this.getAccessToken(resourceId);
          const accessToken = await this.getAccessToken(resourceId);
          console.log(accessToken, "Access Token Inteceptor resquest");
          if (!accessToken) {
            throw new GHLAuthError("No access token available");
          }
          requestConfig.headers["Authorization"] = `Bearer ${accessToken}`;
          return requestConfig;
        } catch (error) {
          throw new GHLAuthError(
            "Failed to set authorization header: " + error.message
          );
        }
      },
      (error) =>
        Promise.reject(
          new GHLAuthError("Request interceptor error: " + error.message)
        )
    );

    axiosInstance.interceptors.response.use(
      (response) => response, // Success case
      async (error) => {
        const originalRequest = error.config;

        // Log error message for debugging
        console.log(error.response?.data?.message, "Data From Axios");

        // Handle 401 Unauthorized errors and check for specific error message
        if (error.response?.status === 401 && !originalRequest._retry) {
          const errorMessage = error.response?.data?.message;

          // Retry flag to prevent infinite loops
          originalRequest._retry = true;

          // Check if the error message is "The token is not authorized for this scope."
          if (errorMessage === "The token is not authorized for this scope.") {
            try {
              // Find locationId in the database based on the resourceId (or another identifier)
              const location = await this.companyModel.findOne({
                locationId: resourceId,
              });

              if (location && location.locationId) {
                console.log(`Found locationId: ${location.locationId}`);

                // Retrieve a new location access token using the locationId
                const locationAccessToken = await this.getLocationAccessToken(
                  location.companyId,
                  location.locationId
                );

                if (locationAccessToken) {
                  // Update tokens in the database (access, refresh, etc.)
                  // location.access_token = locationAccessToken.access_token;
                  location.access_token = encrypt(
                    locationAccessToken.access_token
                  );
                  location.token_type = locationAccessToken.token_type;
                  location.expires_in = locationAccessToken.expires_in;
                  // location.refresh_token = locationAccessToken.refresh_token;
                  location.refresh_token = encrypt(
                    locationAccessToken.refresh_token
                  );
                  location.scope = locationAccessToken.scope;
                  location.userId = locationAccessToken.userId;
                  location.traceId = locationAccessToken.traceId;
                  await location.save();

                  // Update the Authorization header with the new access token
                  originalRequest.headers[
                    "Authorization"
                  ] = `Bearer ${locationAccessToken.access_token}`;

                  // Retry the original request with the new token
                  return axiosInstance(originalRequest);
                } else {
                  console.error("Failed to get location access token.");
                  throw new Error("Unable to retrieve location access token.");
                }
              } else {
                console.error("Location not found in database.");
                throw new Error("Location not found.");
              }
            } catch (err) {
              // Handle errors related to fetching location or tokens
              console.error(
                "Error handling location-based token retrieval:",
                err
              );
              return Promise.reject(
                new GHLTokenRefreshError(
                  "Failed to handle location access token process"
                )
              );
            }
          }

          // If not the specific message, fallback to general token refresh logic
          try {
            const newAccessToken = await this.refreshAccessToken(resourceId);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken.access_token}`;
            return axiosInstance(originalRequest);
          } catch (err) {
            // Handle token refresh failure
            throw new GHLTokenRefreshError(
              "Failed to refresh token in response interceptor"
            );
          }
        }

        // Propagate the error if not handled
        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  async getAccessToken(resourceId) {
    try {
      const company = await this.companyModel.findOne({
        $or: [{ companyId: resourceId }, { locationId: resourceId }],
      });

      if (!company) {
        throw new GHLResourceNotFoundError("Company or Location");
      }
      console.log(company.access_token, "In GEt Acces Token COmpany");
      console.log(decrypt(company.access_token), "In GEt Acces Token COmpany");
      // return company.access_token;
      return decrypt(company.access_token);
    } catch (error) {
      if (error instanceof GHLError) throw error;
      throw new GHLAuthError("Failed to get access token: " + error.message);
    }
  }

  async getTokens(code) {
    try {
      const response = await axios.post(
        "https://services.leadconnectorhq.com/oauth/token",
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectUri,
          user_type: "Company",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        ...response.data,
        access_token: encrypt(response.data.access_token),
        refresh_token: encrypt(response.data.refresh_token),
      };
    } catch (error) {
      throw new GHLAuthError("Failed to get tokens: " + error.message);
    }
  }

  async getLocationAccessToken(companyId, locationId) {
    try {
      const company = await this.companyModel.findOne({ companyId });
      console.log(company, "Company is found");
      if (!company) {
        throw new GHLResourceNotFoundError("Company");
      }

      // const accessToken = company.access_token;
      const accessToken = decrypt(company.access_token);
      console.log(accessToken, "accessToken is found");

      const axiosInstance = this.createAxiosInstance(companyId);
      console.log(axiosInstance, "Data from axiosInstance");
      const response = await axiosInstance.post(
        "https://services.leadconnectorhq.com/oauth/locationToken",
        new URLSearchParams({
          companyId,
          locationId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        }
      );

      return {
        ...response.data,
        access_token: encrypt(response.data.access_token),
        refresh_token: encrypt(response.data.refresh_token),
      };
    } catch (error) {
      if (error instanceof GHLError) throw error;
      throw new GHLAuthError(
        "Failed to get location access token: " + error.message
      );
    }
  }
}

module.exports = GHLAuth;
