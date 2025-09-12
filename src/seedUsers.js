import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import env from "./env.js";

dotenv.config();

const seedUsers = async () => {
  try {

dotenv.config();   // must be before mongoose.connect

    await mongoose.connect(env.MONGO_URI);

    // helper to create user
    const createUser = async (data) => {
      const exists = await User.findOne({ phone: data.phone });
      if (exists) {
        console.log(`${data.role} ${data.departmentName || data.headName} already exists ✅`);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const newUser = new User({
        ...data,
        password: hashedPassword,
      });

      await newUser.save();
      console.log(`${data.role} created: ${data.departmentName || data.headName} 🚀`);
    };

    // Department of Electricity (worker)
    await createUser({
      email: "electricity@municipal.gov",
      phone: "9000000000",
      aadhaar: "DEPT1234567890",
      password: "electricity123",
      role: "department",
      departmentName: "Department of Electricity",
      headName: "Mr. Arjun Mehta",
      wardNumber: "HQ-01",
      villageArea: "City HQ",
      location: "Central Office",
    });

    // Municipal Commissioner (authority)
    await createUser({
      email: "commissioner@municipal.gov",
      phone: "9000000001",
      aadhaar: "AUTH1234567890",
      password: "commissioner123",
      role: "authority",
      headName: "Commissioner Ananya Rao",
      wardNumber: "HQ-ADMIN",
      villageArea: "Municipal HQ",
      location: "Head Office",
    });

    process.exit();
  } catch (err) {
    console.error("Error seeding users:", err.message);
    process.exit(1);
  }
};

seedUsers();
