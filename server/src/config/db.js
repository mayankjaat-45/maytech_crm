import mongoose from "mongoose";

export const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb Connected  : ${conn.connection.name}`);
  } catch (error) {
    console.log("MongoDb Connection Failed  : ", error.message);
    process.exit(1);
  }
};
