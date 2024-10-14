const express = require("express");
const customValuesController = require("./customValueController");
const { decryptSSOData } = require("../../../core/utils/decryptSSO");
const { ssoDecryption } = require("../../../core/middlewares/ssoDecryption");
// const { decryptSSO } = require("../middlewares/decryptSso");
// const checkApiKey = require("../middlewares/checkApiKey");

const router = express.Router();

router.use(ssoDecryption);

router.get("/", customValuesController.getCustomValues);
router.put(
  "/:locationId/customValues/:id",
  customValuesController.updateCustomValue
);
router.post("/:locationId", customValuesController.createCustomValue);
router.post(
  "/createOrUpdate/:locationId",
  customValuesController.createOrUpdateCustomValue
);
router.post(
  "/manageCustomValue/:locationId",
  customValuesController.manageCustomValue
);

module.exports = router;
