// routes/organizationRoutes.js
const express = require("express");
const Organization = require("../models/org.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { protectUser, protectOrganization } = require("../middleware/auth");
const { default: mongoose } = require("mongoose");

// @route POST /organizations/register
// @desc Register a new organization
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password, description, contact } = req.body;

  try {
    // Check if organization already exists
    const organizationExists = await Organization.findOne({ email });
    if (organizationExists) {
      return res.status(400).json({ message: "Organization already exists." });
    }

    // Create a new organization
    const organization = new Organization({
      name,
      email,
      password,
      description,
      contact,
    });
    await organization.save();

    res.status(201).json({ message: "Organization registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route POST /organizations/login
// @desc Login an organization
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if organization exists
    const organization = await Organization.findOne({ email });
    if (!organization) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if password matches
    const isMatch = await organization.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: organization._id,
        email: organization.email,
        name: organization.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/:id", protectOrganization, async (req, res) => {
  const { id } = req.params;

  try {
   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    // Find organization by ID and populate the 'events' field
    const organization = await Organization.findById(id).populate("events");

    // If organization not found
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Return the organization details
    res.status(200).json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
