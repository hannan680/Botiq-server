const { Configuration, OpenAI } = require("openai");

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
