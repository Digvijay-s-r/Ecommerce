const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Please enter a valid password"]
    },
    role: {
        type: String,
        // enum: ["user", "admin","root"],
        default: "user"
    },
    token: String,
}, { timestamps: true })

const User = mongoose.model("User", userSchema);

module.exports = User;
