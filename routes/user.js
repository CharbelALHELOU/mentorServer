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
    pass: 'zsepvcdpogakytry',
  },
});

function capitalize(word) {
  return word[0].toUpperCase + word.slice(1).toLowerCase();
}

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
          from: "mentorpack.contact@gmail.com", // sender address
          to: newUser.email, // list of receivers
          subject: "Welcome to MentorPack", // Subject line
          html: '<h2>Welcome ' + newUser.name + ' ! </h2><p>You are successfully registered !</p> <p>Please find below the link to our secured platform to submit your resume.</p>'// plain text body
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

//function to upload the file
async function uploadFile(filePath, fileName, fileMime) {
  try {
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

    const result = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    console.log(result.data.webViewLink);
    return "https://drive.google.com/file/d/" + response.data.id + "/view?usp=drivesdk";
  } catch (error) {
    return "error";
  }
}


/*
router.post("/upload/:id", multer({ storage: storage }).single("resume"), (req, res) => {
  const filePath = path.join(__dirname, 'resume/', req.file.filename);
  var url = uploadFile(filePath, req.file.filename, req.file.mimetype);
  const user = User.findById(req.params.id);

  user.resumeUrl = url;
  const updatedUser = user.save();
  res.json({ success: true, mentor: updatedMentor });
});*/



router.post(
  "/upload/:id",
  multer({ storage: storage }).single("resume"),
  async (req, res) => {
    const filePath = path.join(__dirname, 'resume/', req.file.filename);
    const fileName = req.file.filename;
    const fileMime = req.file.mimetype;
    try {
      const oldUser = await User.findById(req.params.id);
      if (oldUser.resumeUrl = "") {
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

        const result = await drive.files.get({
          fileId: response.data.id,
          fields: 'webViewLink, webContentLink',
        });

        oldUser.resumeUrl = result.data.webViewLink;

        const updatedUser = await oldUser.save();
        res.json({ success: true, user: updatedUser });
      }
      else {
        res.json({ success: false, message: "Resume already uploaded" });
      }
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: "Failed to upload resume" });
    }
  }
);





/*
router.post('/upload', function (req, res) {
  console.log(req);
  var form = new formidable.IncomingForm();
  form.multiples = true; //enable mutiple for formidable
  form.uploadDir = "resume/";
  var file_name, file_ext;
  var file_id;

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
      });
    }
    //end if    ///-------------------------------------------------------------------------
    ///
    // Load client secrets from a local file.
    fs.readFile('./routes/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), uploadFile);//------
    });
    /////
    // Target forlder for the Uploaded file.
    const targetFolderId = "1LZkwgaHJqkD5J2A5rTz8B_bH9mX2QnjZ";
    function uploadFile(auth) {
      const drive = google.drive({ version: 'v3', auth });

      //upload one file
      var fileMetadata = {
        'name': file_name,
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
          file_id = file.data.id;
          console.log(`file Id:${file.data.id}`);
        }
      });
    }
  })
});




function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
/*

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






router.post(
  "/upload/:id",
  multer({ storage: storage }).single("resumeUrl"),
  (req, res) => {
    var FileId = "";
    const url = req.protocol + "://" + req.get("host");
    User.findOne({ id: req.params.id }).then((user) => {
      if (user) {
        errors.id = "Invalid User";
        return res.status(400).json({ success: false, message: errors.id });
      } else {

        fs.readFile('./routes/credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          // Authorize a client with credentials, then call the Google Drive API.
          authorize(JSON.parse(content), uploadFile);//------
        });
      }
    });



    const targetFolderId = "1dHuEXWVSnyc2ljhtyDGW9Tbm8IyJ0wh6";
    function uploadFile(auth) {
      const drive = google.drive({ version: 'v3', auth });
      //upload one file
      var fileMetadata = {
        'name': req.file.filename,
        parents: [targetFolderId]
      };
      var media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(path.join('resume/', req.file.filename))
      };
      drive.files.create({

        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, function (err, file) {
        if (err) {
          // Handle error
          res.status(400).json({
            success: false,
            message: err,
          })
        } else {
          file_id = file.data.id;
          FileId = file.data.id;
        }
      });
    }
  }
);

*/

























module.exports = router;





