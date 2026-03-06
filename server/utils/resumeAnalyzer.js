const skills = require("../data/skills");

function analyzeResume(text) {
    const lowerText = text.toLowerCase();
    const foundSkills = [];

    skills.forEach(skill => {
        if (lowerText.includes(skill)) {
            foundSkills.push(skill);
        }
    });

    const score = foundSkills.length * 8;
    const suggestions = [];

    if (!lowerText.includes("projects")) {
        suggestions.push("Add a projects section.");
    }

    if (!lowerText.includes("skills")) {
        suggestions.push("Add a skills section.");
    }

    if (foundSkills.length < 4) {
        suggestions.push("Add more technical skills.");
    }

    return {
        score,
        foundSkills,
        suggestions
    };
}

module.exports = analyzeResume;
