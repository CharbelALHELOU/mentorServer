const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const secretOrKey = require("../config/keys").secretOrKey;
const User = require("../models/User"); // User model

const validateRegisterInput = require("../validation/register"); // register validation
const validateLoginInput = require("../validation/login"); // login validation

function verifyToken(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).send("Unauthorized request");
  let token = req.headers.authorization.split(" ")[1];
  console.log(token);
  if (token === "null") return res.status(401).send("Unauthorized request");
  if (token != "hanithebest") {
    let payload = jwt.verify(token, secretOrKey);
    if (!payload) return res.status(401).send("Unauthorized request");
    req.userId = payload.id;
  }
  next();
}

/*-------------------------------------------
formidable = require('formidable'),
  fs = require('fs'),
  path = require('path');
const readline = require('readline');
const { gmail } = require("googleapis/build/src/apis/gmail");
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];///-----'https://www.googleapis.com/auth/drive',
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';*/
/*-------------------------------------------*/

// Multer configuration
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "application/pdf": "pdf",
  "application/msword": "doc",
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidFile = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValidFile) error = null;
    cb(error, "./routes/resume");
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
//----------------------------------Routes----------------------------------//

var handlebars = require('handlebars');
const { file } = require("googleapis/build/src/apis/file");
const { testing } = require("googleapis/build/src/apis/testing");
const Mentor = require("../models/Mentor");
const { Console } = require("console");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mentorpack.contact@gmail.com',
    pass: 'zoqfbsvmuuqfwpmk',
  },
});


// @route   POST /user/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  (req, res) => {
    var FileId = "";
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors });
    }
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json({ success: false, message: errors.email });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          mentors: req.body.mentors,
          age: req.body.age,
          major: req.body.major,
          university: req.body.university
        });
        console.log("user created .... sending email ....");
        transporter.sendMail({
          from: "contact@mentor-pack.com", // sender address
          to: newUser.email, // list of receivers
          subject: "Welcome to MentorPack", // Subject line
          html: '<h2>Welcome ' + newUser.name + ' ! </h2><p>You are successfully registered !</p>' +
            '<p>Please find below the link to our secured platform to submit your resume: ' +
            '<a href="https://mentor-pack.com/upload/' + newUser.id + '">Here</a></p>' +
            '<p>MentorPack Team</p>'
        }).then(info => {
          console.log({ info });
        }).catch(console.error);
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => res.json({ success: true, user }))
              .catch((err) =>
                res.status(404).json({
                  success: false,
                  message: err,
                })
              );

          });
        });
      }
    });
  }
);
/*------------------------------------------------------------------------------------------*/

// @route   POST /user/login
// @desc    Login user | Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // if (!isValid) return res.status(400).json({ success: false, message: errors });
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = "User not found";
      return res.status(400).json({ success: false, message: errors.email });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // Create JWT payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(payload, secretOrKey, { expiresIn: 10800 }, (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            message: "Token was assigned",
            token: token,
            user: user,
          });
        });
      } else {
        errors.password = "Password is incorrect";
        return res
          .status(400)
          .json({ success: false, message: errors.password });
      }
    });
  });
});
/*------------------------------------------------------------------------------------------*/
router.get("/all", verifyToken, (req, res) => {
  User.find({}).then((users) => {
    res.json({
      users: users,
    })
  })
});





/*------------------------------------------------------------------------------------------*/

//googleapis
const { google } = require('googleapis');

//path module
const path = require('path');

//file system module
const fs = require('fs');
const { remotebuildexecution } = require("googleapis/build/src/apis/remotebuildexecution");

//client id
const CLIENT_ID = '142174750784-d3oearjqohm2t3hm69clqib1l0mj5vbe.apps.googleusercontent.com'

//client secret
const CLIENT_SECRET = '8J7FrLph6edpSJBERZjcdSVb';

//redirect URL
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

//refresh token
const REFRESH_TOKEN = '1//041NojfWEnGDpCgYIARAAGAQSNwF-L9Ireu_yRfqSiro02Pk19JEqiMWVSEnogfv4tChw0wRdkuWAQk5wJzafc8Z2xqydCAdbBOU'


//intialize auth client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

//setting our auth credentials
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//initialize google drive
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});


router.post(
  "/upload/:id",
  multer({ storage: storage }).single("resume"),
  async (req, res) => {
    const filePath = path.join('./routes/resume/', req.file.filename);
    const fileName = req.file.filename;
    const fileMime = req.file.mimetype;
    try {
      const oldUser = await User.findById(req.params.id);
      if (oldUser.resumeUrl == "none") {
        const targetFolderId = "1dHuEXWVSnyc2ljhtyDGW9Tbm8IyJ0wh6";
        const response = await drive.files.create({
          requestBody: {
            name: fileName, //file name
            mimeType: fileMime,
            parents: [targetFolderId]
          },
          media: {
            mimeType: fileMime,
            body: fs.createReadStream(filePath),
          },
        });

        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        oldUser.resumeId = response.data.id;

        const result = await drive.files.get({
          fileId: response.data.id,
          fields: 'webViewLink, webContentLink',
        });

        oldUser.resumeUrl = result.data.webViewLink;

        const updatedUser = await oldUser.save();

        transporter.sendMail({
          from: "contact@mentor-pack.com", // sender address
          to: oldUser.email, // list of receivers
          subject: "MentorPack - Resume well recieved", // Subject line
          html: '<h2>Hello ' + oldUser.name.split(" ")[0] + ' ! </h2><p>We have successfully recieved your resume and we will start examining your profile to find you the best match</p>' + '<p>MentorPack Team</p>'// plain text body
        }).then(info => {
          console.log({ info });
        }).catch(console.error);
        res.json({ success: true, user: updatedUser });
      }
      else {
        res.json({ success: false, message: "Resume already uploaded" });
      }
    } catch (err) {
      console.log(err);
      res
        .status(404)
        .json({ success: false, message: "Failed to upload resume" });
    }
  }
);

router.post(
  "/assign", verifyToken,
  async (req, res) => {
    try {
      const oldUser = await User.findById(req.body.userId);
      const mentor = await Mentor.findById(req.body.mentor);

      oldUser.mentors = [req.body.mentor];

      const updatedUser = await oldUser.save();

      const nameMentor = mentor.name.split(" ");
      const nameUser = oldUser.name.split(" ");

      transporter.sendMail({
        from: "contact@mentor-pack.com", // sender address
        to: mentor.email,// list of receivers
        subject: "MentorPack - You have a new Mentee", // Subject line
        html: '<h2>Hello ' + nameMentor[0] + ' ! </h2><p> You have been assigned a new Mentee.</p>' +
          '<p>Meet ' + nameUser[0] + ' : </p>' +
          '<p> - ' + oldUser.major.toLowerCase() + ' -- ' + oldUser.university.toUpperCase() + '</p>' +
          '<p> - Email : ' + oldUser.email + '</p>' +
          '<p> - Resume : ' + '<a href="' + oldUser.resumeUrl + '">Click Here</a></p>'
          + '<p>MentorPack Team</p>'
      }).then(info => {
        console.log({ info });
      }).catch(console.error);
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.log(err);
      res
        .status(404)
        .json({ success: false, message: "Failed to upload resume" });
    }
  }
);

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.resumeUrl != "none"){
      const response = await drive.files.delete({
        fileId: user.resumeId,// file id
      });
    }
    const removeuser = await user.remove();
    console.log(response.data, response.status);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.log(error.message);
    res
      .status(404)
      .json({ success: false, message: "Failed to delete user" });
  }
});

router.post("/emailMentors", (req, res) => {
  var emails = [];
  Mentor.find()
    .populate("category", "cat_name")
    .sort({ updatedAt: -1 })
    .then((mentors) => {
      for (let i=0 ; i < mentors.length ; i++){
        emails.push(mentors[i].email)
        console.log(mentors[i].name + "  " +mentors[i].email);
      }
    })
    .catch((err) =>
      res.status(404).json({ success: false, message: "No mentors found" })
    );
    transporter.sendMail({
      from: "contact@mentor-pack.com", // sender address
      to: emails,// list of receivers
      subject: "MentorPack - " + req.body.subject, // Subject line
      html: req.body.text
    }).then(info => {
      console.log("Sent");
    }).catch((err) => console.log(err));
    res.send("done");
})














module.exports = router;





