const express = require("express");
const aiModalInstructionsController = require("./modelInstructionsController");
const restrict = require("../../../core/middlewares/restrict");

const router = express.Router();

router.use(restrict("admin"));

// Route to get all aiModalInstructions
router.get(
  "/",
  restrict("admin"),
  aiModalInstructionsController.getAllModalInstructions
);

// Route to update a specific aiModalInstruction by ID
router.put(
  "/:id",
  restrict("admin"),
  aiModalInstructionsController.updateModalInstructionById
);

module.exports = router;
