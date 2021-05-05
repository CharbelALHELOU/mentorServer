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
  if (token === "null") return res.status(401).send("Unauthorized request");
  let payload = jwt.verify(token, secretOrKey);
  if (!payload) return res.status(401).send("Unauthorized request");
  req.userId = payload.id;
  next();
}



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
    cb(error, "resume");
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

// @route   POST /user/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  multer({ storage: storage }).single("resumeUrl"),
  (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid)
      return res.status(400).json({ success: false, message: errors });
    const url = req.protocol + "://" + req.get("host");
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json({ success: false, message: errors.email });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          resumeUrl: url + "/resume/" + req.file.filename,
        });
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

// @route   POST /user/login
// @desc    Login user | Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  console.log("OKKKKKKKKKK");
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

router.get("/all", verifyToken, (req, res) => {
  const id = req.userId;
  User.findOne({ _id: id }).then((user) => {
    console.log(user.email);
    if (user.role != 1) {
      return res.status(401).send("error");
    } else {
      User.find().then((users) => {
        res.json({
          users: users,
        })
      })
    }
  })
});


router.put(
  "/:id",
  async (req, res) => {
    console.log(req.body);
    // Constructing a url to the serve
    const newMentors = req.body.mentors;
    try {
      const oldUser = await User.findById(req.params.id);
      oldUser.mentors = newMentors;
      const updatedUser = await oldUser.save();
      res.json({ success: true });
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: "Failed to update mentor" });
    }
  }
);



formidable = require('formidable'),
fs = require('fs'),
path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];///-----
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


router.post('/upload', function (req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = true; //enable mutiple for formidable
  form.uploadDir = "routes/resume/";
  var n = [];
  var file_name, file_ext;
  form.parse(req, function (err, fields, files) {

    // if upload one file
    if (!Array.isArray(files.file)) {
      // `file` is the name of the <input> field of type `file`
      oldpath = files.file.path;
      newpath = form.uploadDir + files.file.name;
      file_name = files.file.name;
      file_ext = files.file.type;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('one file is upload !');
        res.end();
      });
    }
    //end if
    else {
      for (let value of files.file) {
        // `file` is the name of the <input> field of type `file`
        oldpath = value.path;
        newpath = form.uploadDir + value.name;
        n.push(new Object({
          'file_name': value.name,
          'file_type': value.type
        }));

        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;

          res.end('multiple upload success');
        });
      } //end for
    }//end else
    ///-------------------------------------------------------------------------
    ///
    // Load client secrets from a local file.
    fs.readFile('./routes/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), uploadFile);//------
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
      const { client_secret, client_id, redirect_uris } = credentials;//.installed;
      const oAuth2Client = new google.auth.OAuth2(
        credentials.web.client_id, credentials.web.client_secret, "http://localhost:5000");

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
      });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          callback(oAuth2Client);
        });
      });
    }
    /////
    // Target forlder for the Uploaded file.
    const targetFolderId = "1LZkwgaHJqkD5J2A5rTz8B_bH9mX2QnjZ";
    function uploadFile(auth) {
      const drive = google.drive({ version: 'v3', auth });
      //upload one file
      if (n.length == 0) {
        var fileMetadata = {
          'name': file_name+Date.now().toString,
          parents: [targetFolderId]
        };
        var media = {
          mimeType: file_ext,
          body: fs.createReadStream(path.join(__dirname, 'resume/', file_name))
        };
        drive.files.create({

          resource: fileMetadata,
          media: media,
          fields: 'id'
        }, function (err, file) {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            console.log(`file Id:${file.data.id}`);
          }
        });
      }
      else {
        for (let i of n) {
          var fileMetadata = {
            'name': i.file_name,
            parents: [targetFolderId]
          };
          var media = {
            mimeType: i.file_type,
            body: fs.createReadStream(path.join(__dirname, 'resume/', i.file_name))
          };
          drive.files.create({

            resource: fileMetadata,
            media: media,
            fields: 'id'
          }, function (err, file) {
            if (err) {
              // Handle error
              console.error(err);
            } else {
              console.log(`file Id:${file.data.id}`);
            }
          });
        }      //end for
      } //end else
    }
  })
});































































module.exports = router;
