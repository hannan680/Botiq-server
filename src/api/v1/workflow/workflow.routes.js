const express = require("express");
const workflowController = require("./workflowController");

const router = express.Router();

router.get("/checkSnapshot", workflowController.checkSnapshot);

module.exports = router;
