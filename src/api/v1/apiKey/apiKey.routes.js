const express = require("express");
const apiKeyController = require("./apiKeyController");

const router = express.Router();

router.post("/", apiKeyController.storeApiKey);
router.get("/", apiKeyController.getApiKeys);
router.put("/:id", apiKeyController.updateApiKey);
router.delete("/:id", apiKeyController.deleteApiKey);

module.exports = router;
