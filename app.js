require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username,
      password = req.body.password;

    User.findOne(
      {
        email: username
      },
      (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            bcrypt.compare(password, foundUser.password, (err, result) => {
              if (result == true) {
                res.render("secrets");
              }
            });
          }
        }
      }
    );
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      const newUser = new User({
        email: req.body.username,
        password: hash
      });

      newUser.save(err => {
        if (!err) {
          res.render("secrets");
        } else {
          console.log(err);
        }
      });
    });
  });

app.listen(3000, function() {
  console.log("Server started on the port 3000!");
});
