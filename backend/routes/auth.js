const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const SECRET = "secret";

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password)
      return res.status(400).json({ msg: "All fields required" });

    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser)
      return res.status(400).json({ msg: "Email or username already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ email, username, password: hash });
    await user.save();

    res.json({ msg: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- DASHBOARD ----------------
router.get("/dashboard", auth, (req, res) => {
  res.json({
    msg: "Welcome to your dashboard!",
    user: req.user,
    backendFeatures: [
      "JWT Authentication",
      "REST API Development",
      "Database Management (MongoDB)",
      "Password Hashing (bcrypt)",
      "Business Logic Handling",
      "Data Storage & Retrieval"
    ]
  });
});

module.exports = router;