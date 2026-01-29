const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyAb898eruVmokdb_dY3cOudKgZEe4aIcco";
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
    const fs = require('fs');
    fs.writeFileSync('logs.txt', 'Starting Test...\n');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('logs.txt', msg + '\n');
    };

    const models = [
        "gemini-2.0-flash",          // Original attempt
        "gemini-2.0-flash-001",      // Specific version
        "gemini-2.0-flash-lite-preview-02-05", // From search
        "gemini-1.5-flash-8b",       // Alternative
        "gemini-1.5-flash-002",      // Updated 1.5
        "gemini-1.5-pro",            // Stable
    ];

    for (const modelName of models) {
        try {
            log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Just text generation to test model existence
            const result = await model.generateContent("Hello");
            const response = await result.response;
            log(`✅ [${modelName}] SUCCESS. Response: ${response.text()}`);
        } catch (e) {
            log(`❌ [${modelName}] FAILED: ${e.message.split('\n')[0]}`); // First line only
        }
    }
}

run();
