const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Checking valid models...");
        // For some SDK versions listModels is on the client info or similar, 
        // but let's try a direct simple generation to see if we can probe it, 
        // OR better, assuming the SDK supports it (admin/manager API might be needed).
        // Actually, standard AI SDK might not expose listModels directly in all versions.
        // Let's try to just run a simple prompt with a fallback model "gemini-pro" to see if KEY works.

        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await modelPro.generateContent("Hello");
        console.log("gemini-pro Works!", result.response.text());
    } catch (e) {
        console.log("gemini-pro Failed:", e.message);
    }

    try {
        console.log("Trying gemini-1.5-flash...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await modelFlash.generateContent("Hello");
        console.log("gemini-1.5-flash Works!", result.response.text());
    } catch (e) {
        console.log("gemini-1.5-flash Failed:", e.message);
    }

    try {
        console.log("Trying gemini-2.0-flash...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model2.generateContent("Hello");
        console.log("gemini-2.0-flash Works!", result.response.text());
    } catch (e) {
        console.log("gemini-2.0-flash Failed:", e.message);
    }
}

run();
