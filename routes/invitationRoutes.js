const express = require("express");
const router = express.Router();
const Event = require("../models/evnt.model");
const User = require("../models/usr.model");

// @route GET /invite/:invitationCode
// @desc Handle the invitation link
// @access Public
router.get("/:invitationCode", async (req, res) => {
  try {
    const { invitationCode } = req.params;

    // Find the event by the invitation code
    const event = await Event.findOne({ invitationCode });
    if (!event) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invitation code" });
    }

    res
      .status(200)
      .json({ message: "Successfully joined the event as a volunteer", event });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process invitation", error: error.message });
  }
});

module.exports = router;
