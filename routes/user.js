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


const sign = '<img src="https://drive.google.com/uc?export=view&id=1y-Hjshgbjd5I5QivINnijZplQQMdNjxI" alt="" style="height: 70px; width: auto;">';

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
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'contact@mentor-pack.com',
        pass: 'wtyjmnufglpufcxu',
    },
}));


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
                    university: req.body.university,
                    createdAt: Date.now(),
                    relance: 0
                });
                console.log("user created .... sending email ....");
                transporter.sendMail({
                    from: '"MentorPack" <contact@mentor-pack.com>', // sender address
                    to: newUser.email, // list of receivers
                    subject: "Welcome to MentorPack", // Subject line
                    html: '<p>Dear ' + newUser.name + '</p><p>We would like to inform you that we have successfully recieved your application.' +
                        '<p>We are delighted to see that you agreed to take part in our mentorship program.</p>' +
                        '<p>In order to complete your registration please submit your CV on this link: ' +
                        '<a href="https://mentor-pack.com/upload/' + newUser.id + '">Here</a></p>' +
                        "<p>In case this link doesn't work do not hesitate to send us your CV by email and report the error.</p>" +
                        '<p>You will find attached a document explaining our program as well as other information to help you make the most of your journey.</p>' +
                        '<p>Best regards,</p>' +
                        '<p>MentorPack Team</p>' +
                        sign,
                    attachments: [{
                        filename: 'MentorPack program.pdf',
                        path: './routes/MentorPack Role and Responsibility.pdf',
                        contentType: 'application/pdf'
                    }],
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
router.get("/all", verifyToken,
    async(req, res) => {
        try {
            User.find().then((users) => {
                users.shift();

                res.json({
                    users: users,
                })
            })

        } catch (err) {
            res
                .status(404)
                .json({ success: false, message: err });
        }
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
const CLIENT_ID = '515969781661-so1vhjk847nhk0i0t4auvbc6jgcpqrs7.apps.googleusercontent.com'

//client secret
const CLIENT_SECRET = '8TC6-ThzG9BqERGNCs_lDE_V';

//redirect URL
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

//refresh token
const REFRESH_TOKEN = '1//04-je6jqQNmJGCgYIARAAGAQSNwF-L9IrrUBtYCAssi32axfDQf8qL65WkR5sOgEZbcz4nDV8F0UHdNa1HJJgIUspUv2QPcxRfAA'


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
    async(req, res) => {
        const filePath = path.join('./routes/resume/', req.file.filename);
        const fileName = req.file.filename;
        const fileMime = req.file.mimetype;
        try {
            const oldUser = await User.findById(req.params.id);
            if (!oldUser) {
                await unlinkAsync(req.file.filename);
                res.status(404)
                    .json({ success: false, message: "Failed to upload resume" });
            }
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
                    from: '"MentorPack" <contact@mentor-pack.com>', // sender address
                    to: oldUser.email, // list of receivers
                    subject: "MentorPack - Resume well recieved", // Subject line
                    html: '<p>Dear ' + oldUser.name.toLowerCase() +
                        ',</p><p>We have successfully recieved your resume.</p><p>Your registration is now complete, and you will be contacted as soon as a mentor is assigned to you.</p><p>In the meantime, we recommend going over the pdf you received in our initial email to better understand our program and how to prepare for your meetings with your future mentor.</p>' +
                        '<p>Please do not hesitate if you have any questions.</p>' + '<p>Best regards,</p>' + '<p>MentorPack Team</p>' + sign // plain text body
                }).then(info => {
                    console.log({ info });
                }).catch(console.error);
                res.json({ success: true, user: updatedUser });
            } else {
                res.json({ success: false, message: "Resume already uploaded" });
            }
        } catch (err) {
            console.log(err);
            transporter.sendMail({
                from: '"MentorPack" <contact@mentor-pack.com>', // sender address
                to: "alheloucharbel@gmail.com", // list of receivers
                subject: "Error Upload", // Subject line
                html: '<p>' + err + '</p>'
            }).then(info => {
                console.log({ info });
            }).catch(console.error);
            res
                .status(404)
                .json({ success: false, message: "Failed to upload resume" });
        }
    }
);

router.post(
    "/assign", verifyToken,
    async(req, res) => {
        try {
            const oldUser = await User.findById(req.body.userId);
            const mentor = await Mentor.findById(req.body.mentor);

            oldUser.assignedMentor = req.body.mentor;

            const updatedUser = await oldUser.save();

            const nameMentor = mentor.name;
            const nameUser = oldUser.name;

            transporter.sendMail({
                from: '"MentorPack" <contact@mentor-pack.com>', // sender address
                to: mentor.email, // list of receivers
                subject: "MentorPack - You have a new Mentee", // Subject line
                html: '<p>Dear ' + nameMentor + ', </p><p>We hope you are doing well.</p><p>We are delighted to see that you agreed to take part in our mentorship program.</p><p>We are happy to inform you that you have been assigned <b>' + nameUser + '</b> as a mentee.</p>' +
                    "<p>Find below your new mentee's background information and CV.</p>" +
                    '<p> - Major : ' + oldUser.major.toLowerCase() + '</p>' +
                    '<p> - University : ' + oldUser.university.toUpperCase() + '</p>' +
                    '<p> - Email : ' + oldUser.email + '</p>' +
                    '<p> - Resume : ' + ' <a href="' + oldUser.resumeUrl + '">Click Here</a></p><br>' +
                    '<p>If you accept ' + nameUser + ' as a mentee, please reach out to him/her at your convenience and include contact@mentor-pack.com in your email.</p>' +
                    '<p>Otherwise, let us know by replying to this email.</p><br>' +
                    '<p>Please find attached a document explaining our program to help you on your journey as a mentor.</p><br>' +
                    '<p>Best regards,</p>' +
                    '<p>MentorPack Team</p>' +
                    sign,
                attachments: [{
                    filename: 'MentorPack program.pdf',
                    path: './routes/MentorPack Role and Responsibility.pdf',
                    contentType: 'application/pdf'
                }],
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

router.delete("/:id", verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.resumeUrl != "none") {
            const response = await drive.files.delete({
                fileId: user.resumeId, // file id
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
/*
router.post("/emailMentors", verifyToken, (req, res) => {
    var emails = [];
    Mentor.find()
        .sort({ updatedAt: -1 })
        .then((mentors) => {
            for (let i = 0; i < mentors.length; i++) {
                emails.push(mentors[i].email)
                console.log(mentors[i].name + "  " + mentors[i].email);
            }
        })
        .catch((err) =>
            res.status(404).json({ success: false, message: "No mentors found" })
        );
    transporter.sendMail({
        from: "contact@mentor-pack.com", // sender address
        to: emails, // list of receivers
        subject: "MentorPack - " + req.body.subject, // Subject line
        html: req.body.text + '<br><p>MentorPack Team</p>' + sign
    }).then(info => {
        console.log("Sent");
    }).catch((err) => console.log(err));
    res.send("done");
})


router.post("/emailMentees", verifyToken, (req, res) => {
    User.find()
        .sort({ updatedAt: -1 })
        .then((users) => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].resumeUrl = "none") {
                    transporter.sendMail({
                        from: "mentorpack.contact@gmail.com", // sender address
                        to: users[i].email, // list of receivers
                        subject: "MentorPack - Reminder to upload your resume", // Subject line
                        html: '<p>Dear ' + users[i].name + ', </p><p>We hope you are doing well.</p><p>We are delighted to see that you agreed to take part in our mentorship program.</p>' +
                            'We would like to remind you that in order for us to assign you a mentor you need to upload your resume at : <a href="https://mentor-pack.com/upload/' + users[i].id + '">Here</a></p>' +
                            '<br><p>Please feel free to reply if you have any question.</p>' +
                            '<br><p>Regards,</p>' +
                            '<p>MentorPack Team</p>' +
                            sign
                    }).then(info => {
                        console.log("Sent");
                    }).catch((err) => console.log(err));
                    console.log(users[i].name + "  " + users[i].email);
                }
            }
        })
        .catch((err) =>
            res.status(404).json({ success: false, message: "No mentors found" })
        );
    res.send("done");
})

*/












module.exports = router;