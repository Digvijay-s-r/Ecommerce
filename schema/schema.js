const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    rating: Number,
    stock: Number,
})

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
