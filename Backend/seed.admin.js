const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");

async function seedAdmin() {
  // Paste your full MongoDB connection string here directly
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const password = await bcrypt.hash("admin@hirebot2026", 10);
  await User.create({
    username: "hirebot_admin",
    email: "admin@hirebot.com",
    password,
    role: "admin",
    plan: "free",
  });

  console.log(
    "✅ Admin created — email: admin@hirebot.com / password: admin@hirebot2026",
  );
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
