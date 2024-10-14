class GHLWorkflow {
  constructor(ghlAuth) {
    this.ghlAuth = ghlAuth;
  }

  /**
   * Get all workflows for the provided locationId
   * @param {string} locationId - The ID of the location to fetch workflows for
   * @returns {Promise<Object>} - The list of workflows
   */
  async getWorkflows(locationId) {
    const axiosInstance = this.ghlAuth.createAxiosInstance(locationId);
    try {
      const response = await axiosInstance.get(`workflows/`, {
        headers: {
          Version: "2021-07-28",
        },
        params: {
          locationId: locationId,
        },
      });
      return response.data;
    } catch (error) {
      //   console.error("Error fetching workflows:", error);
    }
  }
}

module.exports = GHLWorkflow;
