// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";
// import User from "./models/user.model.js";
// import env from "./env.js";

// dotenv.config();

// const seedUsers = async () => {
//   try {

// dotenv.config();   // must be before mongoose.connect

//     await mongoose.connect(env.MONGO_URI);

//     // helper to create user
//     const createUser = async (data) => {
//       const exists = await User.findOne({ phone: data.phone });
//       if (exists) {
//         console.log(`${data.role} ${data.departmentName || data.headName} already exists ✅`);
//         return;
//       }

//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(data.password, salt);

//       const newUser = new User({
//         ...data,
//         password: hashedPassword,
//       });

//       await newUser.save();
//       console.log(`${data.role} created: ${data.departmentName || data.headName} 🚀`);
//     };

//     // Department of Electricity (worker)
//     await createUser({
//       email: "electricity@municipal.gov",
//       phone: "9000000000",
//       aadhaar: "DEPT1234567890",
//       password: "electricity123",
//       role: "department",
//       departmentName: "Department of Electricity",
//       headName: "Mr. Arjun Mehta",
//       wardNumber: "HQ-01",
//       villageArea: "City HQ",
//       location: "Central Office",
//     });

//     // Municipal Commissioner (authority)
//     await createUser({
//       email: "commissioner@municipal.gov",
//       phone: "9000000001",
//       aadhaar: "AUTH1234567890",
//       password: "commissioner123",
//       role: "authority",
//       headName: "Commissioner Ananya Rao",
//       wardNumber: "HQ-ADMIN",
//       villageArea: "Municipal HQ",
//       location: "Head Office",
//     });

//     process.exit();
//   } catch (err) {
//     console.error("Error seeding users:", err.message);
//     process.exit(1);
//   }
// };

// seedUsers();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import env from "./env.js";

dotenv.config();

const seedUsers = async () => {
  try {
    // Must load env before connecting
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ Connected to DB");

    // helper to create user
    const createUser = async (data) => {
      const exists = await User.findOne({ email: data.email });
      if (exists) {
        console.log(`${data.departmentName} already exists ✅`);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const newUser = new User({
        ...data,
        password: hashedPassword,
      });

      await newUser.save();
      console.log(`🚀 Department created: ${data.departmentName}`);
    };

    // Departments list
    const departments = [
      {
        email: "electricity@municipal.gov",
        phone: "9000000000",
        aadhaar: "DEPT1234567890",
        password: "electricity123",
        role: "department",
        departmentName: "Electricity",
        headName: "Mr. Arjun Mehta",
        wardNumber: "HQ-01",
        villageArea: "City HQ",
        location: "Central Office",
      },
      {
        email: "garbage@municipal.gov",
        phone: "9000000002",
        aadhaar: "DEPT2234567890",
        password: "garbage123",
        role: "department",
        departmentName: "Garbage & Sanitation",
        headName: "Ms. Kavita Sharma",
        wardNumber: "HQ-02",
        villageArea: "City HQ",
        location: "Central Office",
      },
      {
        email: "health@municipal.gov",
        phone: "9000000003",
        aadhaar: "DEPT3234567890",
        password: "health123",
        role: "department",
        departmentName: "Health Services",
        headName: "Dr. Rakesh Nair",
        wardNumber: "HQ-03",
        villageArea: "City HQ",
        location: "Central Office",
      },
      {
        email: "roads@municipal.gov",
        phone: "9000000004",
        aadhaar: "DEPT4234567890",
        password: "roads123",
        role: "department",
        departmentName: "Roads & Infrastructure",
        headName: "Mr. Suresh Verma",
        wardNumber: "HQ-04",
        villageArea: "City HQ",
        location: "Central Office",
      },
      {
        email: "streetlights@municipal.gov",
        phone: "9000000005",
        aadhaar: "DEPT5234567890",
        password: "lights123",
        role: "department",
        departmentName: "Street Lights",
        headName: "Ms. Priya Iyer",
        wardNumber: "HQ-05",
        villageArea: "City HQ",
        location: "Central Office",
      },
      {
        email: "water@municipal.gov",
        phone: "9000000006",
        aadhaar: "DEPT6234567890",
        password: "water123",
        role: "department",
        departmentName: "Water Supply",
        headName: "Mr. Rajesh Patel",
        wardNumber: "HQ-06",
        villageArea: "City HQ",
        location: "Central Office",
      },
    ];

    // Seed all departments
    for (const dept of departments) {
      await createUser(dept);
    }

    console.log("🎉 All departments seeded successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding users:", err.message);
    process.exit(1);
  }
};

seedUsers();
