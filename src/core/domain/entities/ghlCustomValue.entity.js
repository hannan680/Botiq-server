class GHLCustomValue {
  constructor(ghlAuth) {
    this.ghlAuth = ghlAuth;
  }

  async getCustomValues(locationId) {
    const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
    try {
      const response = await axiosInstance.get(
        `/locations/${locationId}/customValues`,
        {
          headers: {
            Version: "2021-07-28",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching custom values:", error);
      throw error;
    }
  }

  async updateCustomValue(locationId, id, name, value) {
    const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
    try {
      const response = await axiosInstance.put(
        `/locations/${locationId}/customValues/${id}`,
        { name, value },
        {
          headers: {
            Version: "2021-07-28",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating custom value:", error);
      throw error;
    }
  }

  async createCustomValue(locationId, name, value) {
    const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
    try {
      const response = await axiosInstance.post(
        `/locations/${locationId}/customValues`,
        { name, value },
        {
          headers: {
            Version: "2021-07-28",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating custom value:", error);
      throw error;
    }
  }

  async updateOrCreate(locationId, name, value) {
    try {
      const customValues = await this.getCustomValues(locationId);
      const existingValue = customValues.customValues.find(
        (cv) => cv.name.toLowerCase() === name.toLowerCase()
      );

      if (existingValue) {
        return await this.updateCustomValue(
          locationId,
          existingValue.id,
          name,
          value
        );
      } else {
        return await this.createCustomValue(locationId, name, value);
      }
    } catch (error) {
      console.error("Error managing custom value:", error);
      throw error;
    }
  }
}

module.exports = GHLCustomValue;
