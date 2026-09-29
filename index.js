require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const Product = require("./schema/schema");
// const User = require("./schema/user");
// const Role = require("./schema/role");
// const Session = require("./schema/session");
// const UserPermission = require("./schema/userPermission");
const { authenticate, authorize, generateToken } = require("./tokenizer");
const userRoutes = require("./routs/routs_user");
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
  res.send("Ecommerce API is running...");
});

app.use("/user", userRoutes);



/*
//----------------------------------------------------//
//--------------------- User routes ------------------//
//----------------------------------------------------//

// Register user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate password length
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Create user in User collection
    const user = await User.create({ name, email, password });

    // Assign Role in UserPermission collection (default: USER)
    const targetRoleName = role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
    const roleDoc = await Role.findOne({ name: targetRoleName });
    if (roleDoc) {
      await UserPermission.create({ userId: user._id, roleId: roleDoc._id });
    }

    // Create active session in Session collection
    const token = generateToken();
    await Session.create({ userId: user._id, token });

    // Save token on user for backwards compatibility
    user.token = token;
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login user
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token and create session
    const token = generateToken();
    await Session.create({ userId: user._id, token });

    // Save token on user for backwards compatibility
    user.token = token;
    await user.save();

    res.json({ message: "User logged in successfully", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout user (deletes active session)
app.post("/logout", authenticate, async (req, res) => {
  try {
    const token = req.header("token");
    await Session.deleteOne({ token });
    res.json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user
app.put("/users/:id", authenticate, authorize, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete user
app.delete("/users/:id", authenticate, authorize, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
*/






//----------------------------------------------------//
//------------------- Product routes -----------------//
//----------------------------------------------------//

//Ge products with search, filter, sort & pagination
app.get("/products/search", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    //Build query object
    const filter = {};

    //keyword search on name and description (case-insensitive, partial match)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    //category filter
    if (category) {
      filter.category = category;
    }

    //price range filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    // 2. Sorting options
    let sortOption = {};
    if (sort === "price_asc") {
      sortOption.price = 1;
    } else if (sort === "price_desc") {
      sortOption.price = -1;
    } else if (sort === "date_asc") {
      sortOption.createdAt = 1;
    } else if (sort === "date_desc") {
      sortOption.createdAt = -1;
    } else { sortOption = { createdAt: 1 }; };

    //3.Pagination 
    const pageNo = parseInt(page);
    const limitNo = parseInt(limit);

    // Calculate skip value
    const skip = (pageNo - 1) * limitNo;

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNo);

    // Count total documents for pagination metadata
    const total = await Product.countDocuments(filter);

    //send response
    res.json({
      products,
      pagination: {
        page: pageNo,
        limit: limitNo,
        total,
        totalPages: Math.ceil(total / limitNo)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all products (Admin & User allowed)
app.get("/products", authenticate, authorize, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single product by ID (Admin & User allowed)
app.get("/products/:id", authenticate, authorize, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create product (Admin only)
app.post("/products", authenticate, authorize, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update product (Admin only)
app.put("/products/:id", authenticate, authorize, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product (Admin only)
app.delete("/products/:id", authenticate, authorize, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
