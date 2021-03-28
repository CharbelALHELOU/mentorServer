const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  cat_name: { type: String },
  mentors: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
});

module.exports = Category = mongoose.model("Category", categorySchema);
