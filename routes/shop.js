const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");

const secretOrKey = require("../config/keys").secretOrKey;

//const User = require("../models/User"); // User model
const Mentor = require("../models/Mentor"); // Mentor model

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

function verifyToken(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).send("Unauthorized request");
  let token = req.headers.authorization.split(" ")[1];
  if (token === "null") return res.status(401).send("Unauthorized request");
  let payload = jwt.verify(token, secretOrKey);
  if (!payload) return res.status(401).send("Unauthorized request");
  req.userId = payload.id;
  next();
}

//----------------------------------Routes----------------------------------//


// @route   GET /shop/mentors
// @desc    Get mentors
// @access  Private
router.get("/mentors", (req, res) => {
  Mentor.find()
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
    const url = "https://thawing-journey-90753.herokuapp.com";

    const newMentor = new Mentor({
      name: req.body.name,
      university: req.body.university,
      position: req.body.position,
      description: req.body.description,
      linkedinUrl: req.body.linkedinUrl,
      imageUrl: url + "/images/" + req.file.filename,
    });
    newMentor.save()
      .then((mentor) => res.json({ success: true, mentor }))
      .catch((err) =>
        res.status(404).json({
          success: false,
          message: err,
        })
      );

  }
);


// @route   DELETE /shop/:id
// @desc    Delete mentor
// @access  Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
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
    const removeMentor = await mentor.remove();
    res.json({ success: true, message: name + " was deleted" });
  } catch {
    res
      .status(404)
      .json({ success: false, message: "Failed to delete mentor" });
  }
});


/*
router.post(
  "/test",
  async (req, res) => {
    try {

      const oldMentors = await Mentor.find();

      for (let i = 0; i < oldMentors.length; i++) {
        oldMentors[i].email = "charbel.helou.98@gmail.com";
        oldMentors[i].show = true;
        var updatedMentor = await oldMentors[i].save();
      }

      //const updatedMentor = await oldMentor.save();
      res.json({ success: true });
    } catch (err) {
      console.log(err)
      res
        .status(404)
        .json({ success: false, message: err });
    }
  }
);*/


router.put(
  "/show/:id", verifyToken,
  async (req, res) => {
    try {

      const oldMentor = await Mentor.findById(req.params.id);
      oldMentor.show = req.body.show;
      var updatedMentor = await oldMentor.save();


      //const updatedMentor = await oldMentor.save();
      res.json({ success: true });
    } catch (err) {
      console.log(err)
      res
        .status(404)
        .json({ success: false, message: err });
    }
  }
);


module.exports = router;
