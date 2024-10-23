const { Configuration, OpenAI } = require("openai");

// class OpenAIService {
//   constructor(apiKey) {
//     this.client = new OpenAI({ apiKey });
//   }

//   async createAssistant(systemPrompt) {
//     return this.client.beta.assistants.create({
//       name: "Bot IQ",
//       instructions: systemPrompt,
//       temperature: 0,
//       model: "gpt-4o",
//     });
//   }

//   async createThread() {
//     return this.client.beta.threads.create();
//   }

//   async addMessageToThread(threadId, message) {
//     return this.client.beta.threads.messages.create(threadId, {
//       role: "user",
//       content: message,
//     });
//   }

//   streamRun(threadId, assistantId) {
//     return this.client.beta.threads.runs.stream(threadId, {
//       assistant_id: assistantId,
//     });
//   }
// }

class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async createAssistant(systemPrompt) {
    return this.client.beta.assistants.create({
      name: "Bot IQ",
      instructions: systemPrompt,
      temperature: 0,
      model: "gpt-4o",
    });
  }

  async retrieveAssistant(assistantId) {
    try {
      return await this.client.beta.assistants.retrieve(assistantId);
    } catch (error) {
      console.error("Error retrieving assistant:", error);
      throw error;
    }
  }

  async updateAssistantInstructions(assistantId, newInstructions) {
    try {
      // Retrieve current assistant to maintain other properties
      const currentAssistant = await this.retrieveAssistant(assistantId);

      // Update only the instructions while keeping other properties the same
      return await this.client.beta.assistants.update(assistantId, {
        instructions: newInstructions,
        name: currentAssistant.name,
        tools: currentAssistant.tools,
        model: currentAssistant.model,
      });
    } catch (error) {
      console.error("Error updating assistant instructions:", error);
      throw error;
    }
  }

  async createThread() {
    return this.client.beta.threads.create();
  }

  async addMessageToThread(threadId, message) {
    return this.client.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
  }

  streamRun(threadId, assistantId) {
    return this.client.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });
  }
}

module.exports = OpenAIService;

// const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

// async function deleteBotIqAssistants() {
//   try {
//     // First get all assistants
//     const myAssistants = await openai.beta.assistants.list({
//       order: "desc",
//       limit: "100",
//     });
//     console.log(myAssistants);
//     // Filter to get Bot IQ assistant IDs
//     const botIqIds = myAssistants.data
//       .filter((assistant) => assistant.name === "Bot IQ")
//       .map((assistant) => assistant.id);

//     console.log("Found Bot IQ Assistant IDs:", botIqIds);

//     // // Delete each Bot IQ assistant
//     const deletionResults = await Promise.all(
//       botIqIds.map(async (id) => {
//         try {
//           const response = await openai.beta.assistants.del(id);
//           return {
//             id,
//             success: true,
//             response,
//           };
//         } catch (error) {
//           return {
//             id,
//             success: false,
//             error: error.message,
//           };
//         }
//       })
//     );

//     // Log results
//     console.log("\nDeletion Results:");
//     deletionResults.forEach((result) => {
//       if (result.success) {
//         console.log(`✓ Successfully deleted assistant: ${result.id}`);
//       } else {
//         console.log(`✗ Failed to delete assistant: ${result.id}`);
//         console.log(`  Error: ${result.error}`);
//       }
//     });

//     return deletionResults;
//   } catch (error) {
//     console.error("Error in deleteBotIqAssistants:", error);
//     throw error;
//   }
// }

// // Execute the function
// deleteBotIqAssistants()
//   .then(() => console.log("Deletion process completed"))
//   .catch((error) =>
//     console.error("Failed to complete deletion process:", error)
//   );
