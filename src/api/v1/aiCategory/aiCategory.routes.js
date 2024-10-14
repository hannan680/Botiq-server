// File: aiCategoryRoutes.js

const express = require("express");
const aiCategoryController = require("./aiCategoryController");
const restrict = require("../../../core/middlewares/restrict");

const router = express.Router();

router.get("/", aiCategoryController.getAllAiCategories);
router.get("/:id", aiCategoryController.getAiCategoryById);
router.use(restrict("admin"));
router.post("/", aiCategoryController.createAiCategory);
router.put("/:id", aiCategoryController.updateAiCategory);
router.delete("/:id", aiCategoryController.deleteAiCategory);

module.exports = router;
