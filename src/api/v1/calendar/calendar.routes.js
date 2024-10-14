const express = require("express");
const calendarController = require("./calendarController");
const { ssoDecryption } = require("../../../core/middlewares/ssoDecryption");

const router = express.Router();

router.get("/", calendarController.getCalendars);

module.exports = router;
