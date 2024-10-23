const OpenAIService = require("../../../core/domain/entities/OpenAiService");
const AnthropicService = require("../../../core/domain/entities/AnthropicService");
const systemPrompt = require("./systemPrompt");
const ApiKey = require("../../../infrastructure/database/models/apiKey.model");
const { decrypt } = require("../../../core/utils/encryption");
const AiModalInstructions = require("../../../infrastructure/database/models/aiModelInstructions");
const getOrCreateAssistant = require("../../../core/utils/getOrCreateAssistant");

const openAIService = new OpenAIService(process.env.OPEN_AI_API_KEY);
// const assistant = getOrCreateAssistant(
//   "6709dd493496f5a842eb2dcf",
//   systemPrompt,
//   openAIService
// );
// console.log(assistant, "Assistant");

exports.gptResponse = async (req, res) => {
  try {
    const { message: userMessage, threadId } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // if (!apiKey) {
    //   return res.status(400).json({ error: "API key is required" });
    // }

    // const openAIService = new OpenAIService(openAIApiKey);

    let thread = threadId
      ? { id: threadId }
      : await openAIService.createThread();
    // const instruction = await AiModalInstructions.findById(
    //   "6709dd493496f5a842eb2dcf"
    // );
    // let aiInstructions = instruction?.prompt || systemPrompt;
    // console.log("AiInstruction", aiInstructions);
    // const assistant = await openAIService.createAssistant(aiInstructions);
    let assistant;
    const result = await getOrCreateAssistant(
      "6709dd493496f5a842eb2dcf",
      systemPrompt,
      openAIService
    );
    if (result?.assistant) {
      assistant = result?.assistant;
    } else {
      throw Error("assistant not found");
    }

    await openAIService.addMessageToThread(thread.id, userMessage);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const runStream = openAIService.streamRun(thread.id, assistant.id);

    runStream
      .on("textCreated", (text) => {
        res.write(`data: ${JSON.stringify({ type: "content", text })}\n\n`);
      })
      .on("textDelta", (textDelta) => {
        const deltaText =
          typeof textDelta.value === "string"
            ? textDelta.value
            : JSON.stringify(textDelta.value);
        res.write(
          `data: ${JSON.stringify({ type: "content", text: deltaText })}\n\n`
        );
      })
      .on("toolCallCreated", (toolCall) => {
        res.write(
          `data: ${JSON.stringify({
            type: "toolCall",
            tool: toolCall.type,
          })}\n\n`
        );
      })
      .on("toolCallDelta", (toolCallDelta) => {
        if (toolCallDelta.type === "code_interpreter") {
          if (toolCallDelta.code_interpreter.input) {
            res.write(
              `data: ${JSON.stringify({
                type: "input",
                input: toolCallDelta.code_interpreter.input,
              })}\n\n`
            );
          }
          if (toolCallDelta.code_interpreter.outputs) {
            res.write(
              `data: ${JSON.stringify({
                type: "output",
                output: toolCallDelta.code_interpreter.outputs,
              })}\n\n`
            );
          }
        }
      })
      .on("end", () => {
        res.write(
          `data: ${JSON.stringify({ type: "done", threadId: thread.id })}\n\n`
        );
        res.end();
      })
      .on("error", (error) => {
        console.error("Error in streaming response:", error);
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: error.message || "Failed to stream response from AI",
          })}\n\n`
        );
        res.end();
      });
  } catch (error) {
    console.error("Error in generating AI response:", error);
    res.status(500).json({ error: "Failed to generate response from AI" });
  }
};

exports.chatAnthropicResponse = async (req, res) => {
  try {
    const { messages } = req.body;
    const { activeLocation: locationId } = req.locationData; // Assuming location is passed in req.location
    const provider = "CLAUDE"; // Provider for Anthropic is CLAUDE
    // Validate messages
    if (!messages || !messages.length) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Fetch the encrypted API key from the database
    const apiKeyRecord = await ApiKey.findOne({ locationId, provider });
    const instruction = await AiModalInstructions.findById(
      "6709dd57b67e93a901efb564"
    );
    let aiInstructions = instruction?.prompt || systemPrompt;

    if (!apiKeyRecord) {
      return res
        .status(404)
        .json({ error: "API key not found for the location and provider" });
    }

    // Decrypt the API key
    const decryptedApiKey = decrypt(apiKeyRecord.encryptedKey);
    console.log("Decrypted Data", decryptedApiKey);
    // Initialize the Anthropic service with the decrypted API key
    const anthropicService = new AnthropicService(decryptedApiKey);

    // Set up server-sent events (SSE) response
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    // Start streaming messages
    const stream = await anthropicService.streamMessages(
      messages,
      aiInstructions
    );

    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ type: "content", text })}\n\n`);
    });

    stream.on("end", () => {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message:
            error.message || "An error occurred while streaming the response",
        })}\n\n`
      );
      res.end();
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      message: error.message,
    });
  }
};
