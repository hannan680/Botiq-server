const { catchAsync } = require("../core/utils/errorHandler");
const AiCategory = require("../infrastructure/database/models/aiCategory.model");

exports.insertDummyCategories = async () => {
  const dummyCategories = [
    {
      name: "Technology",
      description: "AI Employees related to technology sector",
    },
    {
      name: "Healthcare",
      description: "AI Employees focused on healthcare solutions",
    },
    {
      name: "Finance",
      description: "AI Employees working in the finance sector",
    },
    {
      name: "Education",
      description: "AI Employees focused on educational services",
    },
    {
      name: "E-commerce",
      description: "AI Employees specialized in e-commerce platforms",
    },
  ];

  // Check if categories already exist to avoid duplicates
  const existingCategories = await AiCategory.find({
    name: { $in: dummyCategories.map((cat) => cat.name) },
  });

  if (existingCategories.length > 0) {
    console.log("Already added categories");
  }

  await AiCategory.insertMany(dummyCategories);

  console.log("inserted categories");
};
