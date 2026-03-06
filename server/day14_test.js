const fs = require('fs');

(async () => {
    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Day14TestX",
                email: "day14_y_" + Date.now() + "@example.com",
                password: "password123"
            })
        });
        const data = await res.json();
        const token = data.token;

        // 1. Start Interview
        const startRes = await fetch("http://localhost:5000/api/interview/start", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ role: "Frontend Developer" })
        });
        const startRaw = await startRes.text();
        console.log("Start Response:", startRaw);

        const interview = JSON.parse(startRaw);

        // 2. Submit Answers
        const submitRes = await fetch("http://localhost:5000/api/interview/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({
                interviewId: interview._id,
                answers: [
                    "Virtual DOM improves performance by reducing DOM repaints.",
                    "React hooks manage state and side effects in functional components.",
                    "Flexbox is for laying out items in an optimal row/column format."
                ]
            })
        });

        const rawBody = await submitRes.text();
        console.log("Submit Response:", rawBody);
        fs.writeFileSync('day14-result.json', JSON.stringify({ status: submitRes.status, body: rawBody }, null, 2));

    } catch (e) {
        console.error("FATAL:", e);
    }
})();
