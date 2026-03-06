require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
console.log("MONGO_URI found:", uri ? "YES" : "NO");
if (uri) {
  console.log("URI preview:", uri.substring(0, 40) + "...");
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed:", err.message);
    process.exit(1);
  });
