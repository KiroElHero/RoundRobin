const mongoose = require("mongoose");
const TeamMember = require("../schemas/teamMemberSchema"); // Import the model

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/UnixDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Sample Data
const seedData = [
    {
    first_name: "Ahmed",
    last_name: "Karara",
    },
    {
    first_name: "Ibrahem",
    last_name: "Adel",
    },
    {
    first_name: "Shery",
    last_name: "Sami",
    },
    {
    first_name: "Mahmoud",
    last_name: "Mutawalli",
    },
    {
    first_name: "Ahmed",
    last_name: "Khaled",
    },
    {
    first_name: "Ahmed",
    last_name: "Sherif",
    },
    {
    first_name: "Mohamed",
    last_name: "El-Moshrefy",
    },
    {
    first_name: "Nada",
    last_name: "Tobar",
    },
];

// Function to Seed Data
const seedDatabase = async () => {
  try {
    await TeamMember.deleteMany(); // Clear existing data
    await TeamMember.insertMany(seedData);
    console.log("Seeding successful!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
