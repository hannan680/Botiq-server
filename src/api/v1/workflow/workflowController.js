const Location = require("../../../infrastructure/database/models/location.model");
const GHLAuth = require("../../../core/domain/entities/ghlAuth.entity");
const GHLWorkflow = require("../../../core/domain/entities/ghlWorkflow.entity");
const { AppError, catchAsync } = require("../../../core/utils/errorHandler");

// Initialize GHLAuth and GHLWorkflow
const ghlAuth = new GHLAuth(Location);
const ghlWorkflow = new GHLWorkflow(ghlAuth);

exports.checkSnapshot = catchAsync(async (req, res, next) => {
  const { locationId } = req.query;

  // Validate locationId
  if (!locationId) {
    throw new AppError("Location ID is required", 400);
  }

  // Define required workflows
  const requiredWorkflows = [
    { name: "AI.01 Send Message to AI", searchTerm: "Send Message to AI" },
    {
      name: "AI.02 AI Response to Contact",
      searchTerm: "AI Response to Contact",
    },
  ];

  // Fetch workflows
  const workflowsResponse = await ghlWorkflow.getWorkflows(locationId);
  const workflows = workflowsResponse.workflows;

  // Check for required workflows
  const workflowStatus = requiredWorkflows.map((required) => {
    const found = workflows.find(
      (workflow) =>
        workflow.name === required.name ||
        workflow.name.includes(required.searchTerm)
    );

    return {
      requiredName: required.name,
      found: !!found,
      actualWorkflow: found
        ? {
            id: found.id,
            name: found.name,
            status: found.status,
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
          }
        : null,
    };
  });

  const missingWorkflows = workflowStatus
    .filter((status) => !status.found)
    .map((status) => status.requiredName);

  res.status(200).json({
    status: "success",
    data: {
      workflowStatus,
      missingWorkflows,
      allWorkflowsPresent: missingWorkflows.length === 0,
    },
  });
});
