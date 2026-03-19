const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const SECRET = "secret";

// Signup
router.post("/signup", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hash
  });

  await user.save();
  res.json({ msg: "User created" });
});

// Login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

// Dashboard
router.get("/dashboard", auth, (req, res) => {
  res.json({ msg: "Welcome to dashboard" });
});

module.exports = router;