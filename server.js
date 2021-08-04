const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const colors = require("colors");

const mongooseURI = require("./config/keys").mongoURI;

const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/resume", express.static(path.join(__dirname, "resume")));

app.use("/user", userRoutes);
app.use("/shop", shopRoutes);


mongoose
  .connect(mongooseURI)
  .then(() => {
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log("Server running on port".cyan, colors.yellow(port));
    });
    console.log("\nConnected to".cyan, "ng-market".magenta, "database".cyan);
  })
  .catch(err => console.log("Error connecting to database".cyan, err));
