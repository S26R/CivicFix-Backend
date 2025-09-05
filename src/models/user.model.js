import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wardNumber: { type: String },        // for municipal area
  villageArea: { type: String },       // optional if rural
  location: { type: String }, 
  role:{type:String,enum:['citizen','department','authority']}         // citizen or worker
}, { timestamps: true });

export default mongoose.model("User", userSchema);
