const express = require("express");
const aiEmployeeController = require("./aiEmployeeController");
const { upload } = require("../../../core/configs/multer");
const restrict = require("../../../core/middlewares/restrict");
const {
  uploadToFirebase,
} = require("../../../core/middlewares/uploadToFirebase");
const { parseFormData } = require("../../../core/middlewares/parseFormData");

const router = express.Router();

router.post(
  "/",
  restrict("admin"),
  parseFormData,
  uploadToFirebase,
  aiEmployeeController.createAiEmployee
);

router.get("/", restrict("admin"), aiEmployeeController.getAllAiEmployees);
router.get("/published", aiEmployeeController.getPublishedEmployees);
router.get("/draft", restrict("admin"), aiEmployeeController.getDraftEmployees);
router.get("/:id", aiEmployeeController.getAiEmployeeById);
router.get(
  "/category/:categoryId",
  aiEmployeeController.getAiEmployeesByCategory
);

router.put(
  "/:id",
  restrict("admin"),
  parseFormData,
  uploadToFirebase,
  aiEmployeeController.updateAiEmployee
);
router.delete("/:id", restrict("admin"), aiEmployeeController.deleteAiEmployee);
module.exports = router;
