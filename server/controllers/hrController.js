const hrQuestions = require("../data/hrQuestions");

exports.startHRInterview = (req, res) => {
  const shuffled = hrQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  res.json({
    questions: shuffled
  });
};
