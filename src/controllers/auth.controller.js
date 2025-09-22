import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Signup (default: citizen)
export const signup = async (req, res) => {
  try {
    const { name, email, phone, aadhaar, password, wardNumber, villageArea, location } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { phone }, { aadhaar }] });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
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

    res.status(201).json({
      msg: "Signup successful. Default role: citizen",
      user: {
        userId: newUser.userId, // ✅ expose USR-123
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
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

    res.json({
      msg: "Citizen login successful",
      token,
      user: {
        userId: user.userId, // ✅ expose custom ID
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Department Login
export const departmentLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone, role: "department" });

    if (!user) return res.status(404).json({ msg: "Department not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Department login successful",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
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

    res.json({
      msg: "Authority login successful",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Profile
export const profile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by Mongo _id OR custom userId
    const user =
      (await User.findOne({ userId }).select("-password")) ||
      (await User.findById(userId).select("-password"));

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wardNumber: user.wardNumber,
      villageArea: user.villageArea,
      location: user.location,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Logout
export const logout = (req, res) => {
  try {
    res.status(200).json({ msg: "Logout successful" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
