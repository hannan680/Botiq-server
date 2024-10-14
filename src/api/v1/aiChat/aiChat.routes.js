const express = require("express");
const aiChatController = require("./aiChatController");
const { ssoDecryption } = require("../../../core/middlewares/ssoDecryption");

const router = express.Router();

router.post("/claude", ssoDecryption, aiChatController.chatAnthropicResponse);
router.post("/chatgpt", ssoDecryption, aiChatController.gptResponse);

module.exports = router;
