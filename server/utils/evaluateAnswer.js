function evaluateAnswer(answer) {

    if (!answer || answer.length < 10) {
        return 1;
    }

    if (answer.length < 40) {
        return 3;
    }

    if (answer.length < 80) {
        return 4;
    }

    return 5;
}

module.exports = evaluateAnswer;
