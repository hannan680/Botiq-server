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
// exports.updateModalInstructionById = async (req, res) => {
//   const { id } = req.params;
//   const { prompt } = req.body;

//   try {
//     const instruction = await AiModalInstructions.findByIdAndUpdate(
//       id,
//       { prompt, updatedAt: Date.now() },
//       { new: true }
//     );

//     if (!instruction) {
//       return res.status(404).json({ message: "Instruction not found" });
//     }

//     res.status(200).json(instruction);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error updating modal instruction", error });
//   }
// };

exports.updateModalInstructionById = async (req, res) => {
  const { id } = req.params;
  const { prompt } = req.body;
  const openAIService = req.openAIService; // Assuming you pass the service via middleware

  try {
    // First find the instruction to check for assistantId
    const existingInstruction = await AiModalInstructions.findById(id);

    if (!existingInstruction) {
      return res.status(404).json({ message: "Instruction not found" });
    }

    // If there's an assistantId, update the OpenAI assistant first
    if (existingInstruction.assistantId) {
      try {
        const updatedAssistant =
          await openAIService.updateAssistantInstructions(
            existingInstruction.assistantId,
            prompt
          );
      } catch (assistantError) {
        console.error("Error updating OpenAI assistant:", assistantError);
        return res.status(500).json({
          message: "Failed to update OpenAI assistant",
          error: assistantError.message,
        });
      }
    }

    // Update the instruction in database
    const updatedInstruction = await AiModalInstructions.findByIdAndUpdate(
      id,
      {
        prompt,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      instruction: updatedInstruction,
      assistantUpdated: !!existingInstruction.assistantId,
    });
  } catch (error) {
    console.error("Error in updateModalInstructionById:", error);
    res.status(500).json({
      message: "Error updating modal instruction",
      error: error.message,
    });
  }
};
