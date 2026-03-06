const mongoose = require("mongoose");

const DailyChallengeSchema = new mongoose.Schema({

  date: String,

  questions: [String],

  usersCompleted: [String]

});

module.exports = mongoose.model("DailyChallenge", DailyChallengeSchema);
