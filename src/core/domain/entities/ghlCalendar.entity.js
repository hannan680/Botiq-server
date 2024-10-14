class GHLCalendar {
  constructor(ghlAuth) {
    this.ghlAuth = ghlAuth;
  }

  async getCalendars(locationId) {
    const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
    try {
      const response = await axiosInstance.get(`calendars/`, {
        headers: {
          Version: "2021-07-28",
        },
        params: {
          locationId: locationId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching calendars:", error);
      throw error;
    }
  }

  // async updateCustomValue(locationId, id, name, value) {
  //   const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
  //   try {
  //     const response = await axiosInstance.put(
  //       `/locations/${locationId}/customValues/${id}`,
  //       { name, value },
  //       {
  //         headers: {
  //           Version: "2021-07-28",
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error updating custom value:", error);
  //     throw error;
  //   }
  // }

  // async createCustomValue(locationId, name, value) {
  //   const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
  //   try {
  //     const response = await axiosInstance.post(
  //       `/locations/${locationId}/customValues`,
  //       { name, value },
  //       {
  //         headers: {
  //           Version: "2021-07-28",
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error creating custom value:", error);
  //     throw error;
  //   }
  // }

  // async manageCustomValue(locationId, name, value) {
  //   try {
  //     const customValues = await this.getCustomValues(locationId);
  //     const existingValue = customValues.customValues.find(
  //       (cv) => cv.name.toLowerCase() === name.toLowerCase()
  //     );

  //     if (existingValue) {
  //       return await this.updateCustomValue(
  //         locationId,
  //         existingValue.id,
  //         name,
  //         value
  //       );
  //     } else {
  //       return await this.createCustomValue(locationId, name, value);
  //     }
  //   } catch (error) {
  //     console.error("Error managing custom value:", error);
  //     throw error;
  //   }
  // }
}

module.exports = GHLCalendar;
