const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  cases_taken: { type: Number, required: true ,default: 0},
  cases_moved: { type: Number, required: true, default: 0 },
  isTurn: { type: Boolean, default: false },
  orderIndex: { type: Number, default: 0 } 
});

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
