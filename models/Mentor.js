const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mentorSchema = new Schema(
  {
    name: { type: String, required: true },
    university: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String },
    linkedinUrl: { type: String },
    imageUrl: { type: String },
    description : {type : String},
    show : { type: Boolean, default : true}
  },
  { timestamps: true }
);

module.exports = Mentor = mongoose.model("Mentor", mentorSchema);
