const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  role: { type: Number, required: true, default: 0 },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: String, required: true },
  major: { type: String, required: true },
  university: { type: String, required: true },
  resumeUrl: { type: String, required: true, default : 0},
  mentors: [String ],
});

module.exports = User = mongoose.model("User", userSchema);
