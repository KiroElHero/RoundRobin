const express = require("express");
const mongoose = require("mongoose");
const http = require("http"); // Import http for Socket.io
const { Server } = require("socket.io"); // Import Socket.io
const TeamMember = require("./schemas/teamMemberSchema"); // Import your Mongoose model

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server); // Attach Socket.io to the server

const PORT = 8000;

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://root:root@cluster0.cwmh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Serve static files (for HTML, CSS, etc.)
app.use(express.static("public"));

// Route to get team members
app.get("/team-members", async (req, res) => {
  const members = await TeamMember.find().sort({ orderIndex: 1 });
  res.json(members);
});

// Route to get the current turn
app.get("/current-turn", async (req, res) => {
  const currentMember = await TeamMember.findOne({ isTurn: true });
  res.json(currentMember);
});

// Handle "next turn"
app.post("/next-turn", async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ orderIndex: 1 });

    if (members.length === 0) return res.status(400).json({ error: "No team members found" });

    const currentTurnIndex = members.findIndex((member) => member.isTurn);
    if (currentTurnIndex === -1) return res.status(400).json({ error: "No active turn found" });

    const currentMember = members[currentTurnIndex];

    // Increment cases_taken for the current member
    await TeamMember.findByIdAndUpdate(currentMember._id, { $inc: { cases_taken: 1 } });

    // Move turn to next member
    const nextTurnIndex = (currentTurnIndex + 1) % members.length;
    const nextMember = members[nextTurnIndex];

    // Reset all turns and assign the next turn
    await TeamMember.updateMany({}, { $set: { isTurn: false } });
    await TeamMember.findByIdAndUpdate(nextMember._id, { $set: { isTurn: true } });

    // Emit real-time updates
    io.emit("updateTeam", await TeamMember.find().sort({ orderIndex: 1 }));
    io.emit("updateTurn", nextMember);

    res.json(nextMember);
  } catch (error) {
    console.error("Error updating turn:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle "move case"
app.post("/move-case/:id", async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member || member.cases_taken <= 0) {
      return res.json({ message: "No cases to move" });
    }

    await TeamMember.findByIdAndUpdate(member._id, { $inc: { cases_taken: -1, cases_moved: 1 } });

    // Emit real-time update
    io.emit("updateTeam", await TeamMember.find().sort({ orderIndex: 1 }));

    res.json({ message: "Case moved successfully" });
  } catch (error) {
    console.error("Error moving case:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle "reset cases"
app.post("/reset-cases", async (req, res) => {
  try {
    await TeamMember.updateMany({}, { $set: { cases_taken: 0, cases_moved: 0 } });

    // Emit real-time update
    io.emit("updateTeam", await TeamMember.find().sort({ orderIndex: 1 }));

    res.json({ message: "Cases reset successfully" });
  } catch (error) {
    console.error("Error resetting cases:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle "skip turn"
app.post("/skip-turn", async (req, res) => {
  try {
    let members = await TeamMember.find().sort({ orderIndex: 1 });

    if (members.length === 0) return res.status(400).json({ error: "No team members found" });

    let currentTurnIndex = members.findIndex((member) => member.isTurn);
    if (currentTurnIndex === -1) currentTurnIndex = 0;
    else await TeamMember.findByIdAndUpdate(members[currentTurnIndex]._id, { $set: { isTurn: false } });

    const nextTurnIndex = (currentTurnIndex + 1) % members.length;
    const nextMember = members[nextTurnIndex];

    await TeamMember.findByIdAndUpdate(nextMember._id, { $set: { isTurn: true } });

    // Emit real-time updates
    io.emit("updateTurn", nextMember);
    io.emit("updateTeam", await TeamMember.find().sort({ orderIndex: 1 }));

    res.json(nextMember);
  } catch (error) {
    console.error("Error skipping turn:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle "shuffle members"
app.post("/shuffle-members", async (req, res) => {
  try {
    let members = await TeamMember.find();
    if (members.length === 0) return res.status(400).json({ error: "No team members found" });

    // Fisher-Yates Shuffle
    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [members[i], members[j]] = [members[j], members[i]];
    }

    await TeamMember.updateMany({}, { $set: { isTurn: false } });

    for (let i = 0; i < members.length; i++) {
      await TeamMember.findByIdAndUpdate(members[i]._id, { $set: { orderIndex: i } });
    }

    await TeamMember.findByIdAndUpdate(members[0]._id, { $set: { isTurn: true } });

    // Emit real-time updates
    io.emit("updateTeam", await TeamMember.find().sort({ orderIndex: 1 }));
    io.emit("updateTurn", members[0]);

    res.json({ message: "Members shuffled successfully" });
  } catch (error) {
    console.error("Error shuffling members:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
