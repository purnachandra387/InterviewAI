function getBadges(totalInterviews, avgScore) {
    const badges = [];

    if (totalInterviews >= 1) {
        badges.push("Beginner");
    }

    if (totalInterviews >= 5) {
        badges.push("Practice Champion");
    }

    if (avgScore >= 4) {
        badges.push("Top Performer");
    }

    return badges;
}

module.exports = getBadges;
