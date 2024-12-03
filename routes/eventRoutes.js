const express = require("express");
const router = express.Router();
const { protectUser, protectOrganization } = require("../middleware/auth");
const eventService = require("../services/eventService");
const multer = require("multer");
const { body, validationResult } = require("express-validator");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route GET /events
// @desc Get all events
// @access Public
router.get("/", async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get events", error: error.message });
  }
});
// @route GET /events/:eventId
// @desc Get a single event with gallery
// @access Public or Protected (depending on your logic)
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve event", error: error.message });
  }
});

// @route POST /event
// @desc Create a new event
// @access Organization only (requires JWT token)
// Create Event with Logo
router.post(
  "/",
  protectOrganization,
  upload.single("logo"),
  [
    // Validation middleware
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { title, description, date, location } = req.body;
      const orgId = req.user.id;
      const file = req.file;

      // Ensure logo file is uploaded
      if (!file) {
        return res.status(400).json({ message: "Logo file is required" });
      }

      const event = await eventService.createEvent(
        orgId,
        title,
        description,
        date,
        location,
        file
      );

      res.status(201).json(event);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create event", error: error.message });
    }
  }
);

// @route PUT /events/:id
// @desc Update an event
// @access Organization only
router.put("/:id", protectOrganization, async (req, res) => {
  try {
    const updatedEvent = await eventService.updateEvent(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedEvent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update event", error: error.message });
  }
});

// @route POST /events/:id/join
// @desc User joins an event
// @access User only (requires JWT token)
router.post("/:id/join", protectUser, async (req, res) => {
  try {
    const event = await eventService.joinEvent(req.params.id, req.user.id);
    res.status(200).json({ message: "Successfully joined the event", event });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to join event", error: error.message });
  }
});

// @route GET /event/:eventId/invitation-link
// @desc Generate an invitation link for an event
// @access Private (requires authentication, e.g., organization or admin)
router.get(
  "/:eventId/invitation-link",
  protectOrganization,
  async (req, res) => {
    try {
      const { eventId } = req.params;

      // Generate the invitation link
      const invitationLink = await eventService.generateInvitationLink(eventId);

      // Send the generated link as response
      res.status(200).json({
        message: "Invitation link generated successfully",
        invitationLink,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to generate invitation link",
        error: error.message,
      });
    }
  }
);

module.exports = router;
