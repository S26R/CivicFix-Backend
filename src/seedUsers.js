import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import env from "./env.js";

dotenv.config(); // must be before mongoose.connect

const seedUsers = async () => {
  try {
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

    // all your departments from Picker values:
    const departments = [
      "Roads & Infrastructure Department",
      "Street Lighting & Electricity Department",
      "Water Supply & Drainage Department",
      "Sanitation & Waste Management Department",
      "Public Safety & Transport Department",
      "Parks & Public Spaces Department",
      "Pollution Control Department",
      "Animal Control Department",
      "General Department",
    ];

    // loop over each department and create a user
    let phoneCounter = 9000000100; // so each phone number unique
    for (const dept of departments) {
      await createUser({
        email: `${dept.toLowerCase().replace(/[^a-z0-9]+/g, "")}@municipal.gov`,
        phone: String(phoneCounter++),
        aadhaar: `DEPT${Math.floor(1000000000 + Math.random() * 9000000000)}`, // random-ish
        password: "department123", // or make dept-specific if you want
        role: "department",
        departmentName: dept,
        headName: `Head of ${dept}`, // can customize later
        wardNumber: "HQ-01",
        villageArea: "City HQ",
        location: "Central Office",
      });
    }

    // your municipal commissioner (authority)
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

    console.log("✅ All seed data done");
    process.exit();
  } catch (err) {
    console.error("Error seeding users:", err.message);
    process.exit(1);
  }
};

seedUsers();
