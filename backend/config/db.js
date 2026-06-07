import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    
    // if (process.env.NODE_ENV !== "production") {
    // }

    process.exit(1);
  }
};

export default connectDB;
