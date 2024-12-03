const jwt = require("jsonwebtoken");
const User = require("../models/usr.model");
const Organization = require("../models/org.model");

const protectUser = async (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const protectOrganization = async (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for the organization in the database
    const organization = await Organization.findById(decoded.id);
    if (!organization) {
      return res.status(401).json({ message: "Organization not found" });
    }

    // Attach the organization to the request object
    req.user = organization;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { protectUser, protectOrganization };
