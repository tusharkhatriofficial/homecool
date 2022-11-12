const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;
const User = require("./model/users");
const bcrypt = require("bcryptjs");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://fullimagesdb:images143@cluster0.hxc4m.mongodb.net/ImagesDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() =>
    app.listen(4000, () => {
      console.log(`Server running on port ${PORT}`);
    })
  )
  .catch((err) => console.log(err));

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
  res.render("home");
});

app.get("/final", (req, res) => {
  res.render("final");
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { name, email, password, phone } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) return res.redirect("/final");

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.render("home", { newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/signin", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const newUser = await User.findOne({ email });
    if (!newUser) return res.status(404).json({ error: "User doesn't exist" });
    const isMatch = await bcrypt.compare(password, newUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    res.render("home", { newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});
