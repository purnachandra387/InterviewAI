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
        console.log("Token:", token);

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
            const aiData = await aiRes.json();
            console.log("AI Res:", aiData);
        } catch (e) {
            console.log("AI Error MSG:", e.message);
        }
    } catch (e) {
        console.error("Register Error:", e.message);
    }
})();
