const express = require("express");
const router = express.Router();
const User = require("../schema/user");
const Session = require("../schema/session");
const UserPermission = require("../schema/userPermission");
const Role = require("../schema/role");
const { authenticate, authorize, generateToken } = require("../tokenizer");

// Register user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        //validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ massage: "all fields are required" });
        }
        //Check if user alreadu exists
        const existinguser = await User.findOne({ email });
        if (existinguser) {
            return res.status(400).json({ massage: "user already exists" });
        }

        //validate password length
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ massage: "password must be at least 8 characters long" })
        }

        //create user in user collenction 
        const user = await User.create({ name, email, password });

        //Assign role to user 
        const targetRoleName = role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
        const roleDoc = await Role.findOne({ name: targetRoleName });
        if (roleDoc) {
            await UserPermission.create({ userId: user._id, roleId: roleDoc._id });
        }

        //create active session in Session collection
        const token = generateToke();
        await Session.create({ userId: user._id, token });

        // Save token on user for backwards compatibility
        user.token = token;
        await user.save();

        res.status(201).json({
            massage: "user registered successfully",
            token,
            user,
        });
    } catch (error) {
        res.status(500).json({ massage: "server error", error: error.massage })
    }
});

//Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // validate inputs
        if (!email || !password) {
            return res.status(400).json({ massage: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ massage: "invalid email or password" });
        }

        //1. Set maximum allowed active sessions
        const maxActiveSessions = 3;

        // Count active sessions for this user
        const activeSessions = await Session.find({ userId: user._id }).sort({ createdAt: 1 });

        // if limit reacherd/exceeded, delete the oldest session(s)
        if (activeSessions.length >= maxActiveSessions) {
            // find and delete the oldest active sessions
            const deleteCount = activeSessions.length - maxActiveSessions + 1;
            const oldestSessionIds = activeSessions.slice(0, deleteCount).map(s => s._id);
            await Session.deleteMany({ _id: { $in: oldestSessionIds } });
        }

        // Genrate token and create session
        const token = generateToken();
        const session = await Session.create({ userId: user._id, token });

        //Fatch the assigned role name form UserPermission collection (with fallback to user.role)
        let roleName = user.role;

        const permissionEntry = await UserPermission.findOne({ userId: user._id }).populate("roleId", "name");

        if (permissionEntry && permissionEntry.roleId) {
            roleName = permissionEntry.roleId.name.toLowerCase();
        }
        user.role = roleName;


        await user.save();

        res.json({ message: "User logged in successfully", token, roleName, user });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.massage })
    }
});

//Logout user (deletes active session)
router.post("/logout", authenticate, async (req, res) => {
    try {
        const token = req.header("token");
        await Session.deleteOne({ token });
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ massage: "server error", error: error.massage });
    }
});

//Update user
router.put("/users/:id", authenticate, authorize, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({ massage: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ massage: "server error", error: error.massage });
    }
});

//Delete user
router.delete("/users/:id", authenticate, authorize, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ massage: "User not found" });
        }
        res.json({ message: "User deleted successfully", user });
    } catch (error) {
        res.status(500).json({ massage: "server error", error: error.massage });
    }
});







module.exports = router;
