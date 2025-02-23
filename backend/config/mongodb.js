import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("DB Connected");
  });

  // await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
  await mongoose.connect("mongodb://localhost:27017/e-commerce");
};

export default connectDB;
