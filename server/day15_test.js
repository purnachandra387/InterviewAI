const fs = require('fs');

(async () => {
    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Day15Test",
                email: "day15_history_" + Date.now() + "@example.com",
                password: "password123"
            })
        });
        const data = await res.json();
        const token = data.token;

        // 1. Get History (Should be empty initially)
        const hist1 = await fetch("http://localhost:5000/api/interview/history", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });
        const emptyHistory = await hist1.json();

        // 2. Start Interview
        const startRes = await fetch("http://localhost:5000/api/interview/start", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ role: "Frontend Developer" })
        });
        const interview = await startRes.json();

        // 3. Submit Answers
        await fetch("http://localhost:5000/api/interview/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({
                interviewId: interview._id,
                answers: ["Virtual DOM helps React."]
            })
        });

        // 4. Get History (Should have 1 recorded session)
        const hist2 = await fetch("http://localhost:5000/api/interview/history", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });
        const fullHistory = await hist2.json();

        fs.writeFileSync('day15-result.json', JSON.stringify({
            emptyHistoryLength: emptyHistory.length,
            fullHistoryLength: fullHistory.length,
            latestRole: fullHistory[0]?.role,
            latestScore: fullHistory[0]?.score,
            latestFeedback: fullHistory[0]?.feedback
        }, null, 2));

    } catch (e) {
        fs.writeFileSync('day15-result.json', JSON.stringify({ fatal: e.message }));
    }
})();
