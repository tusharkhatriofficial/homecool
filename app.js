const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index");  
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/home", (req, res) => {
    res.render("index");
});

app.post("/home", (req, res) => {
    let name = req.body.name;
    console.log(req.body);
    // res.render("home")
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${PORT}`);
});