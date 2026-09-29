require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("./schema/role");
const User = require("./schema/user");
const UserPermission = require("./schema/userPermission");

async function seedRoles() {
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://singhdig726_db_user:baWBMV6FymMEA2tP@cluster0.xqoncf3.mongodb.net/Ecommercedb?appName=Cluster0";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB.");

    //create a new role 
    await Role.create({
      name: "Root",
      description: "Root have access to CRUD oprations of any user."
    })

    //Assign root role to raju12@gmail.com
    const rootUser = await User.findOne({ email: "raju12@gmail.com" })
    const rootRole = await Role.findOne({ name: "Root" })
    if (rootUser) {
      await UserPermission.create({ userId: rootUser._id, roleId: rootRole._id });
      console.log(`User '${rootUser.email}' assigned role '${rootRole.name}'.`);
    }





    // 1. Create default roles (no permissions array, just name & description)
    const roles = [
      {
        name: "ADMIN",
        description: "Administrator with full access to manage products and users",
      },
      {
        name: "USER",
        description: "Standard registered user with access to browse products",
      },
    ];

    for (const r of roles) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
      console.log(`Role '${r.name}' ready.`);
    }

    // 2. Assign ADMIN role to an existing user (e.g. vika12@gmail.com)
    const adminUser = await User.findOne({ email: "vika12@gmail.com" });
    const adminRole = await Role.findOne({ name: "ADMIN" });

    if (adminUser && adminRole) {
      await UserPermission.findOneAndUpdate(
        { userId: adminUser._id, roleId: adminRole._id },
        { userId: adminUser._id, roleId: adminRole._id },
        { upsert: true, new: true }
      );
      console.log(`User '${adminUser.email}' assigned role '${adminRole.name}'.`);
    }

    console.log("Roles and UserPermissions seeded successfully!");
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
}

seedRoles();
