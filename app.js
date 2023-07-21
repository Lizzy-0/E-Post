const express = require("express");
const app = express();
require("dotenv").config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
require("dotenv").config();
const md5 = require("md5")
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const axios = require('axios');
const puppeteer = require("puppeteer")

app.use(
  session({
    secret: "This is a secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://"+procees.env.INFO+"@e-post.hnzgosl.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: "784226573040-v2dv2chnvus1ilg2sssp571gviapvvjm.apps.googleusercontent.com",
      clientSecret: process.env.SECRET,
      callbackURL: "https://lizzy-epost.onrender.com/auth/google/loggedIn",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log(profile);

      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // User already exists, proceed with authentication
          return cb(null, existingUser);
        }

        // Create a new user with the provided Google profile information
        const newUser = new User({
          googleId: profile.id,
        });

        await newUser.save();

        // New user created successfully
        return cb(null, newUser);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

app.get("/", (req, res) => {
  res.render("home",{message:"Login"});
});
app.get("/click-and-drop", (req, res) => { 
  res.render("click-and-drop",{message:""})
})
app.get("/login", (req, res) => { 
  res.render("login")
})
app.get("/signup", (req, res) => { 
  res.render("signup")
})
app.get("/tracker", (req, res) => { 
  res.render("tracker",{message:""})
})


app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/loggedIn",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets page or any other desired page
    res.redirect("/");
  }
);
app.post("/login", (req, res) => { 
  const enteredPassword = md5(req.body.password)
  const existingUser = User.findOne({ email: req.body.email }).then(function (user) {
    console.log(user)
    if (user.password === enteredPassword) {
    res.render("home",{message:"Logout"})
  }
  else if (user.password != enteredPassword) {
    res.send("<h1>Wrong Login Credentials</h1><h2>Try Agaib</h2>")
    }
    else {
      res.send("User not found,Try Again")
    }
  })
  // console.log(existingUser)
  
});
app.post("/signup", (req, res) => {
  const user = new User({
    username : req.body.f_name + " " + req.body.l_name,
    email: req.body.email,
    password: md5(req.body.password)
  })
  user.save()
  res.render("home",{message:"Logout"})
})
app.get("/get-postcode", function (req, res) {
  res.render("postcode", { message: "",address:"", postcode:"", latitude:"", longitude:""})
  
})
app.post("/get-postcode", function (req, res) {
  async function getPostalCode(locationName) {
    const apiKey = process.env.APIKEY ;
    const encodedLocationName = encodeURIComponent(locationName);
    console.log(encodedLocationName)
    const geocodingEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address='+encodedLocationName+'&key='+apiKey
    try {
        const response = await axios.get(geocodingEndpoint)

        const results = response.data.results;
        if (results && results.length > 0) {
            const latitude = results[0].geometry.location.lat;
            const longitude = results[0].geometry.location.lng;
            const address = results[0].formatted_address
            return { latitude, longitude, address }
        }
        else {
            return 'Location not found';
            }
        } catch (error) {
            console.error('Error:', error);
            return 'Error occurred';
        }
}
async function scrapePostCode(url) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
    executablePath: process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUATBLE_PATH : puppeteer.executablePath()
  });
  const page = await browser.newPage();

  try {
    await page.goto(url);
    const [el] = await page.$x('/html/body/main/header/h3/a');
    const txt = await el.getProperty("textContent");
    const rawTxt = await txt.jsonValue();

    return { rawTxt };
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    res.render("postcode",{message: "", address: "Not Found", postcode: "Not Found", latitude:"Not Found",longitude:"Not Found"})
    return { rawTxt: "" };
  } finally {
    await browser.close();
  }
}

const locationName = req.body.location;
getPostalCode(locationName)
.then(({ latitude, longitude, address }) => {
    // console.log('Latitude:', latitude);
    // console.log('Longitude:', longitude);
  scrapePostCode("https://findthatpostcode.uk/points/" + latitude + "," + longitude + ".html").then((rawTxt) => {
    console.log(rawTxt);
    console.log('Address:', address);
    res.render("postcode", { message: "", address: address, postcode: rawTxt, latitude:Math.round(latitude),longitude:Math.round(longitude)});
  })
  


})
    .catch((error) => {
        console.error('Error:', error);
    })
})
app.listen(process.env.PORT||3000,"0.0.0.0", (req, res) => {
  console.log("Server started on Port 3000")
})
