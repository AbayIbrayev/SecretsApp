# SecretsApp

<p align="center">
  <img width="200" height="200" alt="logo" src="public/img/logo.PNG">
</p>

**Secrets app using Node.js/Express/EJS** minimalist clone of the Whisper app where you can share your secrets anonymously.

- Bootstrap(https://getbootstrap.com/) is used for styling
- All the data is stored on MongoDB Atlas using Mongoose
- Users are authenticated using Passport.js(http://www.passportjs.org/) and Google OAuth 2.0 (https://github.com/jaredhanson/passport-oauth2)
- App is deployed on heroku and can be previewed here https://sharesecrets.herokuapp.com/

## To make changes

- If you want to make any changes in the app or if you had any issues/bugs you can fork the app and try to pull request to my repo and I will be able to merge your changes

## To set up your own Secrests app

- I strongly recommend to use environment variables to secure your sensitive data (https://www.npmjs.com/package/dotenv)
- You can just simply clone the app and set it up like I explain below:

1. First you need to install all the packages by openning the repository directory in your terminal and run **npm install**
2. You need to set up a database cluster for your app on **mongoDB Atlas**(https://www.mongodb.com/cloud/atlas)
3. Link your cluster with the app in the **app.js** file

```
mongoose.connect(
  'HERE_YOU_INSERT_THE_LINK_FROM_YOUR_CLUSTER', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);
```

4. Set up your app on the **Google Developers Console**(https://console.developers.google.com/)
5. In the dashboard select **API & Services** and set up **OAuth 2.0** credentials for your web app
6. Insert your app's **Client ID** and **Client Secret** from the **Google Developers Console** into the **app.js** file

```
passport.use(
  new GoogleStrategy({
      clientID: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      callbackURL: "YOUR_OWN_URL/auth/google/secrets",
      // callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({
        googleId: profile.id
      }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
```

7. Set up a random string for the **Passport.js** to secure sessions/cookies

```
app.use(
  session({
    secret: 'YOUR_LONG_AND_SECURE_STRING',
    resave: false,
    saveUninitialized: false
  })
);
```

8. Deploy your app on **heroku** and set up all your config variables(https://dashboard.heroku.com/)
9. Finally! Now you have your own Secrets app =)

# Thank you for checking my app! :v:

- Hope this repository will be helpfull, happy coding or using! :grin:
