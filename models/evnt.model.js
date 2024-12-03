const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  invitationCode: { type: String, unique: true, default: () => nanoid(10) },
  gallery: {
    logo: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    before: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
    after: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  },
});

eventSchema.pre("save", function (next) {
  if (!this.invitationCode) {
    this.invitationCode = nanoid(10);
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
