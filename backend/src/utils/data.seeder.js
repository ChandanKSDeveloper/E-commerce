import Product from "../models/product.model.js"
import dotenv from "dotenv"
import connectDB from "../config/database.js"
import productJson from "../data/products.json" with { type: "json" };
import productJson2 from "../data/products2.json" with { type: "json" };

dotenv.config()
connectDB()


const seedProducts = async () => {
    try {
        // await Product.deleteMany()
        // console.log("✅ All products deleted");

        await Product.insertMany(productJson2)
        console.log("✅ Data inserted successfully");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error.message);
        process.exit(1);
    }
}

seedProducts();