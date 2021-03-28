const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mentorSchema = new Schema(
  {
    name: { type: String, required: true },
    university: { type: String, required: true },
    linkedinUrl: { type: String },
    imagenUrl: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

module.exports = Mentor = mongoose.model("Mentor", mentorSchema);
