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

//--------------------------------Middleware--------------------------------//

function verifyToken(req, res, next) {/*
  if (!req.headers.authorization)
    return res.status(401).send("Unauthorized request");
  let token = req.headers.authorization.split(" ")[1];
  if (token === "null") return res.status(401).send("Unauthorized request");
  let payload = jwt.verify(token, secretOrKey);
  if (!payload) return res.status(401).send("Unauthorized request");
  req.userId = payload.id;*/
  next();
}

//----------------------------------Routes----------------------------------//

// @route   GET /shop/info
// @desc    Get mentors and orders info
// @access  Public
router.get("/info", async (req, res) => {
  try {
    let mentorsTotal = await Mentor.find().count();
    let ordersTotal = await Order.find().count();
    res.json({ success: true, mentorsTotal, ordersTotal });
  } catch {
    res
      .status(404)
      .json({ success: false, message: "Failed to retrive information" });
  }
});

// @route   GET /shop/mentors
// @desc    Get mentors
// @access  Private
router.get("/mentors", verifyToken, (req, res) => {
  Mentor.find()
    .populate("category", "cat_name")
    .sort({ updatedAt: -1 })
    .then((mentors) => res.json({ success: true, mentors }))
    .catch((err) =>
      res.status(404).json({ success: false, message: "No mentors found" })
    );
});

// @route   GET /shop/mentors/:id
// @desc    Get mentor by id
// @access  Private
router.get("/mentors/:id", verifyToken, (req, res) => {
  Mentor.findById(req.params.id)
    .then((mentor) => res.json({ success: true, mentor }))
    .catch((err) =>
      res
        .status(404)
        .json({ success: false, message: "No mentor found with that ID" })
    );
});

// @route   GET /shop/category/:category
// @desc    Get mentors by category
// @access  Private
router.get("/category/:category", verifyToken, (req, res) => {
  Category.find({ cat_name: req.params.category })
    .populate({ path: "mentors", select: "-category" })
    .sort({ updatedAt: -1 })
    .then((mentors) => res.json({ success: true, mentors: mentors[0].mentors }))
    .catch((err) =>
      res
        .status(404)
        .json({ success: false, message: "No mentors found for this category" })
    );
});

// @route   GET /shop/search/:prod_name
// @desc    Get mentors by mentor name
// @access  Private
router.get("/search/:prod_name", verifyToken, (req, res) => {
  Mentor.find({ prod_name: { $regex: req.params.prod_name, $options: "i" } })
    .populate("category")
    .sort({ updatedAt: -1 })
    .then((mentors) => res.json({ success: true, mentors }))
    .catch((err) =>
      res
        .status(404)
        .json({ success: false, message: "No mentors found by this name" })
    );
});

// @route   GET /shop/category
// @desc    Get categories
// @access  Private
router.get("/category", verifyToken, (req, res) => {
  Category.find()
    .then((categories) => res.json({ success: true, categories }))
    .catch((err) =>
      res.status(404).json({ success: false, message: "No categories found" })
    );
});

// @route   POST /shop/category
// @desc    Create category
// @access  Private
router.post("/category", verifyToken, (req, res) => {
  const { errors, isValid } = validateCategoryInput(req.body);
  if (!isValid)
    return res.status(400).json({ success: false, message: errors.cat_name });
  Category.findOne({ cat_name: req.body.cat_name })
    .then((category) => {
      if (category) {
        errors.cat_name = "Category already exists";
        return res
          .status(400)
          .json({ success: false, message: errors.cat_name });
      } else {
        const newCategory = new Category(req.body);
        return newCategory
          .save()
          .then((category) => res.json({ success: true, category }));
      }
    })
    .catch((err) =>
      res
        .status(404)
        .json({ success: false, message: "Could not create new category" })
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
    const url = req.protocol + "://" + req.get("host");
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

// @route   PUT /shop/:id
// @desc    Update mentor
// @access  Private
router.put(
  "/:id",
  verifyToken,
  multer({ storage: storage }).single("imageUrl"),
  async (req, res) => {
    // Constructing a url to the server
    const url = req.protocol + "://" + req.get("host");
    const imageFile = req.file;
    const newMentorName = req.body.name;
    const newUniversity = req.body.university;
    const newPosition = req.body.position;
    const newLinkedinUrl = req.body.linkedinUrl;
    const newCategoryName = req.body.category;
    try {
      const oldMentor = await Mentor.findById(req.params.id);
      const oldCategory = await Category.findById(oldMentor.category);
      if (newCategoryName !== oldCategory.cat_name) {
        const newCategory = await Category.findOne({
          cat_name: newCategoryName,
        });
        newCategory.mentors.push(oldMentor._id);
        const updatedNewCategory = await newCategory.save();
        const removeIndex = oldCategory.mentors.indexOf(req.params.id);
        oldCategory.mentors.splice(removeIndex, 1);
        const updatedOldCategory = await oldCategory.save();
        oldMentor.category = newCategory._id;
      }
      oldImageName = oldMentor.name;
      let oldPath = oldMentor.imageUrl.split(url).pop();
      if (imageFile) {
        fs.unlink("." + oldPath, (err) => {
          if (err)
            return res
              .status(400)
              .json({ success: false, message: "Failed to delete image file" });
        });
        oldMentor.imageUrl = url + "/images/" + imageFile.filename;
      }
      oldMentor.name = newMentorName ? newMentorName : oldMentor.name;
      oldMentor.university = newUniversity
        ? newUniversity
        : oldMentor.university;
      oldMentor.position = newPosition
        ? newPosition
        : oldMentor.position;
      oldMentor.linkedinUrl = newLinkedinUrl
        ? newLinkedinUrl
        : oldMentor.linkedinUrl;
      const updatedMentor = await oldMentor.save();
      res.json({ success: true, mentor: updatedMentor });
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: "Failed to update mentor" });
    }
  }
);

// @route   DELETE /shop/:id
// @desc    Delete mentor
// @access  Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    const category = await Category.findById(mentor.category);
    const removeIndex = category.mentors.indexOf(req.params.id);
    let name = mentor.name;
    // deleting image file
    if (mentor) {
      let url = req.protocol + "://" + req.get("host");
      let Path = mentor.imageUrl.split(url).pop();
      fs.unlink("." + Path, (err) => {
        if (err)
          return res
            .status(400)
            .json({ success: false, message: "Failed to delete image file" });
      });
    }
    category.mentors.splice(removeIndex, 1);
    const updatedCategory = await category.save();
    const removeMentor = await mentor.remove();
    res.json({ success: true, message: name + " was deleted" });
  } catch {
    res
      .status(404)
      .json({ success: false, message: "Failed to delete mentor" });
  }
});

router.get("/current", (req, res) => {
  console.log(req.query.userId);
  User.findById(req.query.userId)
    .then((user) =>
      Order.find()
        .where("user.userId")
        .equals(req.userId)
        .sort({ updatedAt: -1 })
        .then((orders) => res.json({ success: true, user, orders }))
    )
    .catch((err) =>
      res
        .status(404)
        .json({ success: false, message: "Could not fetch user data" })
    );
});


module.exports = router;
