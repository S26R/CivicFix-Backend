import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Signup (default: citizen)
export const signup = async (req, res) => {
  try {
    const { email, phone, aadhaar, password, wardNumber, villageArea, location } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { phone }, { aadhaar }] });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      phone,
      aadhaar,
      password: hashedPassword,
      wardNumber,
      villageArea,
      location,
      role: "citizen", // 👈 default
    });

    await newUser.save();
    res.status(201).json({ msg: "Signup successful. Default role: citizen" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Citizen Login (phone or aadhaar + password)
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ phone: identifier }, { aadhaar: identifier }],
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Citizen login successful", role: user.role, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Department Login
// ✅ Department Login
export const departmentLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: "department" });
    
    // 💡 Fix: Check if user exists BEFORE comparing passwords
    if (!user) return res.status(404).json({ msg: "Department not found" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Department login successful", role: user.role, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Authority Login
export const authorityLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: "authority" });

    if (!user) return res.status(404).json({ msg: "Authority not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Authority login successful", role: user.role, token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// controllers/auth.controller.js
// ... (your existing imports and functions)

// ✅ Logout
export const logout = (req, res) => {
  try {
    // This is optional on the backend with JWTs, as the client handles token deletion.
    // However, it's good for a clear API response.
    res.status(200).json({ msg: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};