require("dotenv").config();
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("./hashPassword");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check required environment variables
    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the .env file"
      );
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await hashPassword(adminPassword);

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log(`Admin user created: ${adminEmail}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();