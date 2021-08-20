const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const colors = require("colors");
const User = require("./models/User"); // User model

const mongooseURI = require("./config/keys").mongoURI;

const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/resume", express.static(path.join(__dirname, "resume")));

app.use("/user", userRoutes);
app.use("/shop", shopRoutes);

const nodemailer = require('nodemailer');
const { send } = require("process");
const { connect } = require("mongoose");

const sign = '<img src="https://drive.google.com/uc?export=view&id=1y-Hjshgbjd5I5QivINnijZplQQMdNjxI" alt="" style="height: 70px; width: auto;">';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'contact@mentor-pack.com',
        pass: 'wtyjmnufglpufcxu',
    },
});

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function NumberOfDays(a) {
    // Discard the time and time-zone information.
    const utc1 = Date.parse(a);
    const utc2 = Date.now();

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function logEveryDay(i) {
    setTimeout(() => {
        User.find({ resumeUrl: "none" }).then(async(usersPending) => {
            for (let j = 0; j < usersPending.length; j++) {
                let days = Math.trunc(NumberOfDays(usersPending[j].createdAt));
                let send = false;
                if (usersPending[j].relance < 2) {
                    if (days < 7) {
                        console.log("don't send");
                    }
                    if (days => 7 && days < 14) {
                        if (usersPending[j].relance < 1) {
                            send = true;
                        } else {
                            console.log("don't send");
                        }
                    }
                    if (days > 14) {
                        send = true;
                    }
                }

                if (send) {
                    transporter.sendMail({
                        from: "contact@mentor-pack.com", // sender address
                        to: usersPending[j].email, // list of receivers
                        subject: "MentorPack - Reminder to upload your CV", // Subject line
                        html: '<p>Dear ' + usersPending[j].name.toLowerCase() +
                            ',</p><p>Thank you for your interest in MentorPack. We have successfully received  your application, but you have yet to upload your CV. Please note that this step is required so that we can understand your expectations and background before assigning you a mentor.</p><p> Here you may find the link to submit your resume : ' +
                            '<a href="https://mentor-pack.com/upload/' + usersPending[j].id + '">Click Here</a></p>' +
                            '<p>Please do not hesitate if you have any questions.</p>' + '<p>Best regards,</p>' + '<p>MentorPack Team</p>' + sign // plain text body
                    }).then(async(info) => {
                        console.log("Reminder sent to " + usersPending[j].name);
                        usersPending[j].relance = usersPending[j].relance + 1;
                        const updated = await usersPending[j].save();
                    }).catch(console.error);


                }
            }
            console.log("DAY - " + i);
            logEveryDay(++i);
        })
    }, _MS_PER_DAY)
}

mongoose
    .connect(mongooseURI)
    .then(() => {
        const port = process.env.PORT || 5000;
        const server = app.listen(port, () => {
            console.log("Server running on port".cyan, colors.yellow(port));
        });
        console.log("\nConnected to".cyan, "ng-market".magenta, "database".cyan);
        logEveryDay(0);

    })
    .catch(err => console.log("Error connecting to database".cyan, err));