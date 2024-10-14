const Anthropic = require("@anthropic-ai/sdk");

class AnthropicService {
  constructor(apiKey) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async streamMessages(messages, systemPrompt) {
    return this.anthropic.messages.stream({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 2000,
      temperature: 0,
      system: systemPrompt,
      messages: messages,
    });
  }
}

module.exports = AnthropicService;
