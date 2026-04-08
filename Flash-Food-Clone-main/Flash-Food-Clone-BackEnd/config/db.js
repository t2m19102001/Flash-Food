import mongoose from "mongoose";
import 'dotenv/config';

export const connectDB = async () => {
    try {
        const dbURI = process.env.MONGO_URI;

        if (!dbURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(dbURI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit process if cannot connect to DB
    }
};

export default connectDB;