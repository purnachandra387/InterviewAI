const DailyChallenge = require("../models/DailyChallenge");
const questions = require("../data/questions");

exports.getDailyChallenge = async (req, res) => {

  const today = new Date().toISOString().slice(0,10);

  let challenge = await DailyChallenge.findOne({ date: today });

  if (!challenge) {

    const roleQuestions = questions["frontend developer"];

    const selected = roleQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0,3);

    challenge = await DailyChallenge.create({
      date: today,
      questions: selected,
      usersCompleted: []
    });

  }

  res.json(challenge);

};
