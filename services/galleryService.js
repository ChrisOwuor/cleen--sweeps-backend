const Event = require("../models/evnt.model");
const Image = require("../models/img.model");
const { uploadToS3 } = require("../utils/s3");

const addImagesToGallery = async (eventId, type, files) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const url = await uploadToS3(
          file.path,
          `events/${eventId}/${type}/${file.filename}`
        );
        const image = new Image({ url, uploadedBy: event.organization });
        await image.save();
        return image._id;
      })
    );

    if (type === "before") {
      event.gallery.before.push(...uploadedImages);
    } else if (type === "after") {
      event.gallery.after.push(...uploadedImages);
    }

    await event.save();
    return event.gallery;
  } catch (error) {
    throw new Error("Failed to add images to gallery");
  }
};

module.exports = { addImagesToGallery };
