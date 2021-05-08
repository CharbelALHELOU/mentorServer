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

/*-------------------------------------------*/
formidable = require('formidable'),
  fs = require('fs'),
  path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const { gmail } = require("googleapis/build/src/apis/gmail");
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive','https://mail.google.com/'];///-----'https://www.googleapis.com/auth/drive',
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
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

    console.log(req);
    const isValidFile = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValidFile) error = null;
    cb(error, "routes/resume");
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
    console.log(req);
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
          resumeUrl: url + "/routes/resume/" + req.file.filename,
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

        fs.readFile('./routes/credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          // Authorize a client with credentials, then call the Google Drive API.
          authorize(JSON.parse(content), uploadFile);//------
        });















      }
    });



    const targetFolderId = "1LZkwgaHJqkD5J2A5rTz8B_bH9mX2QnjZ";
    function uploadFile(auth) {
      const drive = google.drive({ version: 'v3', auth });
      //upload one file
      var fileMetadata = {
        'name': Date.now().toString() + " - " + req.file.filename,
        parents: [targetFolderId]
      };
      var media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(path.join(__dirname, 'resume/', req.file.filename))
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






  }
);

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

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'mentorpack.contact@gmail.com',
    pass: 'CharbelHaniNourarethe3founders!'
  }
}));
var handlebars = require('handlebars');

var mailOptions = {
  from: 'mentorpack.contact@gmail.com',
  to: 'alheloucharbel@gmail.com',
  subject: 'Sending Email using Node.js[nodemailer]',
  text: "test test test"
};

var readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
      if (err) {
          throw err;
          callback(err);
      }
      else {
          callback(null, html);
      }
  });
};

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
  
      readHTMLFile('routes/index.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
             username: "John Doe"
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
          from: 'mentorpack.contact@gmail.com',
          to: 'alheloucharbel@gmail.com',
          subject: 'Sending Email using Node.js[nodemailer]',
            html : htmlToSend
         };
         transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            }
        });
    });






/*
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 

*/


      res.json({ success: true });
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: "Failed to update mentor" });
    }

    
  }
);
/*

      fs.readFile('./routes/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), sendMessage);//------
      });



    function makeBody(to, from, subject, message) {
      var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
      ].join('');

      var encodedMail = new Buffer((str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_'));
      return encodedMail;
    }

    function sendMessage(auth) {
      const gmail = google.gmail({ version: 'v1', auth });
      var raw = makeBody('alheloucharbel@gmail.com', 'mentorpack.contact@gmail.com', 'Mentorpack test', "helloooooo");
      gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
          raw: raw
        }
      }, function (err, response) {
        console.log(err );
      });
    }




*/





router.post('/upload', function (req, res) {
  console.log(req.body);
  var form = new formidable.IncomingForm();
  form.multiples = true; //enable mutiple for formidable
  form.uploadDir = "routes/resume/";
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







router.get('/:id', function (req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = true; //enable mutiple for formidable
  form.uploadDir = "routes/resume/";


  //end if    ///-------------------------------------------------------------------------
  ///
  // Load client secrets from a local file.
  fs.readFile('./routes/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), downloadFiles);
    //res.writeHead( 200, { 'Content-Type': 'application/pdf' } );
    fs.createReadStream('./routes/resume/ok.pdf').pipe(res);//------
  });

  function downloadFiles(auth) {
    //const returnData = [];
    const drive = google.drive({ version: 'v3', auth });

    const fileId = req.params.id;
    const dest = fs.createWriteStream('./routes/resume/ok.pdf');
    /* drive.files.list().then((list,err) => {
       console.log(list.data.files);
     });*/
    drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' },
      function (err, res) {
        res.data
          .on('end', () => {
            console.log('Done');
          })
          .on('error', err => {
            console.log('Error', err);
          })
          .pipe(dest);
      }
    );


  };


});
































module.exports = router;
