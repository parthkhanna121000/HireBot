const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/user.model");
const Job = require("./src/models/job.model");
const Application = require("./src/models/application.model");

async function seedData() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Create some jobseeker users
  const pass = await bcrypt.hash("password123", 10);

  const users = await User.insertMany([
    {
      username: "alice",
      email: "alice@test.com",
      password: pass,
      role: "jobseeker",
      plan: "free",
    },
    {
      username: "bob",
      email: "bob@test.com",
      password: pass,
      role: "jobseeker",
      plan: "pro",
      planStartDate: new Date(),
      planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      username: "carol",
      email: "carol@test.com",
      password: pass,
      role: "jobseeker",
      plan: "pro",
      planStartDate: new Date(),
      planExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      subscriptionId: "annual_123",
    },
    {
      username: "recruiter1",
      email: "rec@test.com",
      password: pass,
      role: "recruiter",
      plan: "free",
    },
  ]);

  console.log("✅ Users created");

  // Create a job
  const job = await Job.create({
    title: "Senior React Developer",
    description: "We need a React developer",
    requiredSkills: ["React", "Node.js", "TypeScript"],
    isActive: true,
    postedBy: users[3]._id,
    companyName: "TechCorp",
  });

  console.log("✅ Job created");

  // Create applications
  await Application.insertMany([
    {
      applicant: users[0]._id,
      job: job._id,
      matchScore: 82,
      status: "pending",
      aiSummary: "Good fit",
    },
    {
      applicant: users[1]._id,
      job: job._id,
      matchScore: 91,
      status: "shortlisted",
      aiSummary: "Excellent fit",
    },
    {
      applicant: users[2]._id,
      job: job._id,
      matchScore: 67,
      status: "rejected",
      aiSummary: "Missing skills",
    },
  ]);

  console.log("✅ Applications created");
  console.log("✅ All done — refresh your admin dashboard");
  process.exit(0);
}

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});
