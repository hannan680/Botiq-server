const AiModalInstructions = require("../../infrastructure/database/models/aiModelInstructions");

async function getOrCreateAssistant(
  instructionId,
  systemPrompt,
  openAIService
) {
  try {
    // Find the instruction by ID
    const instruction = await AiModalInstructions.findById(instructionId);

    if (!instruction) {
      throw new Error("Instructions not found");
    }

    // If assistantId exists, try to retrieve the assistant
    if (instruction.assistantId) {
      try {
        const existingAssistant = await openAIService.retrieveAssistant(
          instruction.assistantId
        );
        console.log("Retrieved existing assistant:", instruction.assistantId);
        return {
          assistant: existingAssistant,
          assistantId: instruction.assistantId,
          isNewAssistant: false,
        };
      } catch (retrieveError) {
        console.log(
          "Failed to retrieve assistant, creating new one:",
          retrieveError.message
        );
        // If retrieval fails, continue to create new assistant
      }
    }

    // Create new assistant (either because no assistantId exists or retrieval failed)
    const aiInstructions = instruction?.prompt || systemPrompt;
    const newAssistant = await openAIService.createAssistant(aiInstructions);

    // Update the instruction document with the new assistantId
    instruction.assistantId = newAssistant.id;
    await instruction.save();

    return {
      assistant: newAssistant,
      assistantId: newAssistant.id,
      isNewAssistant: true,
    };
  } catch (error) {
    console.error("Error in getOrCreateAssistant:", error);
    throw error;
  }
}

module.exports = getOrCreateAssistant;
