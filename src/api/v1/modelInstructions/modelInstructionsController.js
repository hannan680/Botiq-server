const AiModalInstructions = require("../../../infrastructure/database/models/aiModelInstructions");

// Controller to get all aiModalInstructions
exports.getAllModalInstructions = async (req, res) => {
  try {
    const instructions = await AiModalInstructions.find();

    res.status(200).json(instructions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching modal instructions", error });
  }
};

// Controller to update a specific aiModalInstruction by ID
exports.updateModalInstructionById = async (req, res) => {
  const { id } = req.params;
  const { prompt } = req.body;

  try {
    const instruction = await AiModalInstructions.findByIdAndUpdate(
      id,
      { prompt, updatedAt: Date.now() },
      { new: true }
    );

    if (!instruction) {
      return res.status(404).json({ message: "Instruction not found" });
    }

    res.status(200).json(instruction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating modal instruction", error });
  }
};
