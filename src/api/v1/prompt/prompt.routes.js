const express = require("express");
const promptController = require("./promptController");
// const { decryptSSO } = require("../middlewares/decryptSso");
// const checkApiKey = require("../middlewares/checkApiKey");

const router = express.Router();

router.get("/:locationId", promptController.getGeneratedPrompt);
router.post("/:locationId", promptController.savePrompt);

module.exports = router;
