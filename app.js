//jshint esversion:6
require('dotenv').config();
const express = require("express"); 
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//require google strategy
const findOrCreate = require("mongoose-findorcreate");


// 1 TODO: Require all these 3 packages, we don't have to require "passport-local" as it is already included with "passport-local-mongoose"
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// 2 TODO: use session here
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 432000000, 
        httpOnly: true
    }
}));

// 3 TODO: Initialize passport once we are done with "express-session"
app.use(passport.initialize());
// 4 TODO: Now we have to make passport use the "express-session" module
app.use(passport.session());


//database stuff
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});


// new mongoose.Schema({}) is must if we want to use plugins with schemas.
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    phone: String,
});

// 5 TODO: use userSchema with "passport-local-mongoose" to hash and salt password.
userSchema.plugin(passportLocalMongoose); 
userSchema.plugin(findOrCreate);


//create the above userSchema before creating new mongoose model
const User = new mongoose.model("User", userSchema);

// 6 TODO: Finally we will use "passport-local" module to create and read cookies
passport.use(User.createStrategy());

//below is the older way to serialize and deserialize
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.serializeUser());
passport.serializeUser(function(User, done) {
    done(null, User.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, User) {
      done(err, User);
    });
  });


//database stuff ends


app.get("/", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect("/home");
    }else{
        res.render("index");
    }
});

app.get("/signup", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect("home");
    }else{
        res.render("signup");
    }
});

app.get("/signin", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect("home");
    }else{
        res.render("signin");
    }
});


app.get("/home", (req, res) => {
    
    if(req.isAuthenticated()){
        res.render("home", {name: req.user.name});
    }else{
        res.redirect("/index")
    }
});

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { 
            console.log("An error occured while logging out");
        }else{
            res.redirect('/');
        }
    });
});

app.get("/account", (req, res) => {

    if(req.isAuthenticated()){
        let name = req.user.name;
        let email = req.user.username;
        let phone = req.user.phone;
        res.render("account", {name: name, email: email, phone: phone});
    }else{
        res.redirect("/")
    }
});

app.get("*", (req, res) => {
    res.render("404");
});

app.post("/signup", (req, res) => {
    let name = req.body.name;
    let phone = req.body.phone;

    User.register({username: req.body.username}, req.body.password, (err, user) => {

        if(!err){
          passport.authenticate("local")(req, res, function(){
            User.findById(user._id, (err, foundUser) => {
            if(err){
              console.log(err);
            } else{
              if(foundUser){
                foundUser.name = req.body.name,
                foundUser.phone = req.body.phone,
                console.log(req.body.phone);
                foundUser.save(() => {
                  res.redirect("/home");
                });
              }
            }
          });
            // res.redirect("/home")
        });
        
        } else {
            console.log("error in registering");
            res.redirect("/signup")
        }
    
    });
});

app.post("/signin", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
        });

    req.login(user, function(err) {
        if (err) { 
            console.log("An error occured while logging in");
            res.redirect('/signin');
        }else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect('/home');
            });
        }
    });

});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log("Server started on port 3000");
});