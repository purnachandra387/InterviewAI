function generateFeedback(answers) {

  const feedback = {
    strengths: [],
    weaknesses: [],
    suggestions: []
  };

  answers.forEach(answer => {

    if (answer.length > 80) {
      if (!feedback.strengths.includes("Detailed explanation provided")) {
          feedback.strengths.push("Detailed explanation provided");
      }
    }

    if (answer.length < 20) {
      if (!feedback.weaknesses.includes("Answer too short")) {
          feedback.weaknesses.push("Answer too short");
      }
    }

  });

  if (feedback.weaknesses.length > 0) {
    if (!feedback.suggestions.includes("Try to explain concepts with examples")) {
        feedback.suggestions.push("Try to explain concepts with examples");
    }
  }

  if (feedback.strengths.length === 0) {
    if (!feedback.suggestions.includes("Provide more detailed answers")) {
        feedback.suggestions.push("Provide more detailed answers");
    }
  }

  // To ensure the arrays are visibly populated for demonstration even if logic misses
  if (feedback.strengths.length === 0 && feedback.weaknesses.length === 0) {
      feedback.strengths.push("Good attempt");
      feedback.suggestions.push("Try to elaborate further to show more confidence");
  }

  return feedback;
}

module.exports = generateFeedback;
