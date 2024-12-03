
const multer = require("multer");
const express = require("express");
const router = express.Router();
const galleryService = require("../services/galleryService");
const protectOrganization = require("../middleware/protectOrganization");

const upload = multer({ dest: "uploads/" });

// Add Images to Gallery
router.post(
  "/:eventId",
  protectOrganization,
  upload.array("images"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { type } = req.body; // Type can be "before" or "after"

      if (!["before", "after"].includes(type)) {
        return res.status(400).json({ message: "Invalid gallery type" });
      }

      const updatedGallery = await galleryService.addImagesToGallery(
        eventId,
        type,
        req.files // Pass the uploaded files
      );

      res
        .status(200)
        .json({ message: "Images added to gallery", updatedGallery });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to add images", error: error.message });
    }
  }
);

module.exports = router;
