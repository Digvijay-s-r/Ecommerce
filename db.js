const mongoose = require("mongoose");


async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://singhdig726_db_user:baWBMV6FymMEA2tP@cluster0.xqoncf3.mongodb.net/Ecommercedb?appName=Cluster0");
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

module.exports = connectDB;