import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log("connected successfully");
  } catch (err) {
    console.log("error in connecting mongo db", err);
  }
};
export default connectDb;
