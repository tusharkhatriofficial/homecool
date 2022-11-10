const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("home");  
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${PORT}`);
});