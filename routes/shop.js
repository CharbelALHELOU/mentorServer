const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");

const secretOrKey = require("../config/keys").secretOrKey;

//const User = require("../models/User"); // User model
const Mentor = require("../models/Mentor"); // Mentor model
const Category = require("../models/Category"); // Category model
const Order = require("../models/Order"); // Order model

const validateCategoryInput = require("../validation/category"); // category validation
const validateMentorInput = require("../validation/mentor"); // mentor validation
/*const validateOrderInput = require("../validation/order"); // mentor validation
 */
// Multer configuration
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidFile = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValidFile) error = null;
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-")
      .split(".")
      .slice(0, -1)
      .join(".");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});





// @route   GET /shop/mentors
// @desc    Get mentors
// @access  Private
router.get("/mentors", (req, res) => {
  Mentor.find()
    .populate("category", "cat_name")
    .sort({ updatedAt: -1 })
    .then((mentors) => res.json({ success: true, mentors }))
    .catch((err) =>
      res.status(404).json({ success: false, message: "No mentors found" })
    );
});





// @route   POST /shop
// @desc    Create mentor
// @access  Private
router.post(
  "/",
  multer({ storage: storage }).single("imageUrl"),
  (req, res) => {
    const { errors, isValid } = validateMentorInput(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });
    // Constructing a url to the server
    Category.findOne({ cat_name: req.body.category })
      .then((category) => {
        if (!category) {
          const newCategory = new Category({ cat_name: req.body.category });
          return newCategory.save();
        } else return category;
      })
      .then((category) => {
        const newMentor = new Mentor({
          name: req.body.name,
          university: req.body.university,
          position: req.body.position,
          description : req.body.description,
          linkedinUrl: req.body.linkedinUrl,
          imageUrl: url + "/images/" + req.file.filename,
          category: category._id,
        });
        return newMentor.save();
      })
      .then((mentor) => {
        Category.findById(mentor.category).then((category) => {
          category.mentors.push(mentor._id);
          category
            .save()
            .then((category) => res.json({ success: true, mentor, category }));
        });
      })
      .catch((err) =>
        res
          .status(404)
          .json({ success: false, message: "Could not create new mentor" })
      );
  }
);







module.exports = router;
