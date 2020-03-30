require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  `mongodb+srv://admin-abay:${process.env.PASSWORD}@secrets-6h62e.mongodb.net/userDB`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
//local
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://sharesecrets.herokuapp.com/auth/google/secrets",
      // callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function(err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("https://sharesecrets.herokuapp.com/secrets");
  }
);

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    // const username = req.body.username,
    //   password = req.body.password;
    // User.findOne(
    //   {
    //     email: username
    //   },
    //   (err, foundUser) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       if (foundUser) {
    //         bcrypt.compare(password, foundUser.password, (err, result) => {
    //           if (result == true) {
    //             res.render("secrets");
    //           }
    //         });
    //       }
    //     }
    //   }
    // );
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, err => {
      if (err) {
        alert(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    //   const newUser = new User({
    //     email: req.body.username,
    //     password: hash
    //   });
    //   newUser.save(err => {
    //     if (!err) {
    //       res.render("secrets");
    //     } else {
    //       console.log(err);
    //     }
    //   });
    // });
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          alert(err);
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        }
      }
    );
  });

app.route("/secrets").get((req, res) => {
  User.find({ secret: { $ne: null } }, (err, foundUsers) => {
    if (err) {
      alert(err);
    } else {
      if (foundUsers) {
        res.render("secrets", { usersWithSecrets: foundUsers });
      }
    }
  });
});

app.route("/logout").get((req, res) => {
  req.session.destroy(err => {
    if (err) {
      alert(err);
    } else {
      req.logout();
      res.redirect("/");
    }
  });
});

app
  .route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    const submittedSeccret = req.body.secret;

    User.findById(req.user.id, (err, foundUser) => {
      if (err) {
        alert(err);
      } else {
        foundUser.secret = submittedSeccret;
        foundUser.save(() => {
          res.redirect("/secrets");
        });
      }
    });
  });

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started!");
});
