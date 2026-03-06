const fs = require('fs');

(async () => {
    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "TestUser",
                email: "testuser_" + Date.now() + "@example.com",
                password: "password123"
            })
        });
        const data = await res.json();
        const token = data.token;

        let out = "";

        try {
            const aiRes = await fetch("http://localhost:5000/api/ai/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    role: "Frontend Developer",
                    type: "technical"
                })
            });
            const textResponse = await aiRes.text();
            out = JSON.stringify({ status: aiRes.status, text: textResponse });
        } catch (e) {
            out = JSON.stringify({ error: e.message });
        }
        fs.writeFileSync('test-response.json', out);
    } catch (e) {
        fs.writeFileSync('test-response.json', JSON.stringify({ fatal: e.message }));
    }
})();
