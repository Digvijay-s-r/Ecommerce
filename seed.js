const mongoose = require("mongoose");
const Product = require("./schema");
const config = require("./config");

const mockProducts = [
  {
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    price: 399.99,
    description: "Industry-leading noise cancellation with two processors and eight microphones for unprecedented sound quality and crystal-clear hands-free calling.",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    rating: 4.8,
    stock: 25,
  },
  {
    name: "Apple MacBook Pro 14\" (M3 Pro)",
    price: 1999.0,
    description: "Supercharged by M3 Pro chip with an 11-core CPU and 14-core GPU, Liquid Retina XDR display, and up to 18 hours of battery life.",
    category: "Computers",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    rating: 4.9,
    stock: 15,
  },
  {
    name: "Nike Air Max 270",
    price: 159.99,
    description: "Boasts Nike's biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks. Breathable mesh upper.",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    rating: 4.6,
    stock: 40,
  },
  {
    name: "Minimalist Leather Chronograph Watch",
    price: 189.5,
    description: "Sleek stainless steel case with genuine Italian leather strap, scratch-resistant sapphire crystal glass, and 50m water resistance.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    rating: 4.7,
    stock: 30,
  },
  {
    name: "Logitech MX Master 3S Wireless Performance Mouse",
    price: 99.99,
    description: "Quiet clicks and an 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling for ultimate speed and precision.",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
    rating: 4.9,
    stock: 50,
  },
  {
    name: "Classic Denim Jacket",
    price: 89.0,
    description: "Premium washed cotton denim jacket with button flap chest pockets and adjustable waist tabs for a timeless vintage fit.",
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    rating: 4.5,
    stock: 35,
  },
  {
    name: "Ceramic Pour-Over Coffee Dripper Set",
    price: 45.0,
    description: "Handcrafted artisan ceramic dripper with heat-resistant glass server. Designed for precise extraction and richer coffee flavor.",
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
    rating: 4.7,
    stock: 20,
  },
  {
    name: "Samsung 34\" Ultra-Wide Curved Gaming Monitor",
    price: 549.99,
    description: "165Hz refresh rate, 1ms response time, WQHD resolution, and AMD FreeSync Premium for seamless immersive gameplay.",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    rating: 4.7,
    stock: 12,
  },
  {
    name: "Polarized Retro Sunglasses",
    price: 65.0,
    description: "Handcrafted acetate frame with UV400 polarized lenses that eliminate glare while providing 100% UVA/UVB protection.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    rating: 4.4,
    stock: 60,
  },
  {
    name: "Stainless Steel Insulated Water Bottle (32oz)",
    price: 34.99,
    description: "Double-wall vacuum insulation keeps drinks ice cold up to 24 hours or piping hot up to 12 hours. Leak-proof straw lid.",
    category: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    rating: 4.8,
    stock: 75,
  },
];

async function seedData() {
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://singhdig726_db_user:baWBMV6FymMEA2tP@cluster0.xqoncf3.mongodb.net/Ecommercedb?appName=Cluster0";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully.");

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log("Inserting mock products...");
    const inserted = await Product.insertMany(mockProducts);

    console.log(`\n Successfully seeded ${inserted.length} products!`);
    console.log("--------------------------------------------------");
    inserted.forEach((item, idx) => {
      console.log(`${idx + 1}. [${item.category}] ${item.name} - $${item.price}`);
    });
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
}

seedData();
