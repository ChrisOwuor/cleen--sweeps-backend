const User = require("../models/usr.model");
const Organization = require("../models/org.model");
const Event = require("../models/evnt.model");
const { uploadToS3 } = require("../utils/s3");
const Image = require("../models/img.model");
const dotenv = require("dotenv");
dotenv.config();

// Get all events
const getAllEvents = async () => {
  try {
    return await Event.find()
      .select("title description status gallery.logo")
      .populate({
        path: "gallery.logo",
        select: "url",
      });
  } catch (error) {
    throw new Error("Failed to get events");
  }
};

// Create a new event
const createEvent = async (orgId, title, description, date, location, file) => {
  try {
    // Find the organization by its ID
    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Upload the file to S3 and get the key
    const { key } = await uploadToS3(file, process.env.AWS_S3_BUCKET_NAME);

    // Initialize logoUrl and save the image in the database if provided
    let logoUrl = null;
    if (file) {
      const newImage = new Image({
        url: key,
        uploadedBy: orgId,
      });

      await newImage.save();
      logoUrl = newImage._id; // Save the image ID for the event schema
    }

    // Create the new event
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      organization: orgId,
      gallery: {
        logo: logoUrl, // Save the logo image ID here
      },
    });

    await newEvent.save();

    // Add the event to the organization's events array
    organization.events.push(newEvent._id);
    await organization.save();

    return newEvent;
  } catch (error) {
    throw new Error("Failed to create event: " + error.message);
  }
};


// Update an event
const updateEvent = async (eventId, updatedData) => {
  try {
    const event = await Event.findByIdAndUpdate(eventId, updatedData, {
      new: true,
    });
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  } catch (error) {
    throw new Error("Failed to update event");
  }
};

// Join an event
const joinEvent = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.volunteers.includes(userId)) {
      throw new Error("User already joined the event");
    }

    event.volunteers.push(userId);
    await event.save();
    return event;
  } catch (error) {
    throw new Error("Failed to join event");
  }
};
// generate invitation link
const generateInvitationLink = async (eventId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const invitationLink = `${process.env.BACKEND_URL}/api/invite/${event.invitationCode}`;
  return invitationLink;
};

//get event by id
const getEventById = async (eventId) => {
  try {
    const event = await Event.findById(eventId)
      .populate("gallery.logo", "url") // Populate logo field with the image URL
      .populate("gallery.before", "url") // Populate before images with their URLs
      .populate("gallery.after", "url") // Populate after images with their URLs
      .populate("organization", "name"); // Optionally include organization details

    return event;
  } catch (error) {
    throw new Error("Failed to retrieve event");
  }
};

module.exports = {
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  joinEvent,
  generateInvitationLink,
};
