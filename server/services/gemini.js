const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");


// Default key from ENV
const defaultApiKey = process.env.GEMINI_API_KEY;

async function extractDataWithGemini(filePath, mimeType, customApiKey = null) {
    try {
        const apiKey = customApiKey || defaultApiKey;
        if (!apiKey) {
            throw new Error("API Key is missing. Please provide a Gemini API Key.");
        }

        // Initialize dynamically
        const genAI = new GoogleGenerativeAI(apiKey);
        const fileManager = new GoogleAIFileManager(apiKey);

        console.log(`[GEMINI] Uploading file: ${filePath}`);

        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType: mimeType,
            displayName: "Medical Bill",
        });

        console.log(`[GEMINI] File uploaded: ${uploadResult.file.uri}`);

        // Wait for processing if video (not needed for images/pdf usually, but good practice)
        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === "PROCESSING") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === "FAILED") {
            throw new Error("File processing failed.");
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        console.log("[GEMINI] Generating content...");
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri
                }
            },
            { text: SYSTEM_PROMPT }
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("[GEMINI] Response received");

        // Clean and parse
        let jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Safety fallback for JSON parsing
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // Try to find the first { and last }
            const start = jsonStr.indexOf("{");
            const end = jsonStr.lastIndexOf("}");
            if (start !== -1 && end !== -1) {
                return JSON.parse(jsonStr.substring(start, end + 1));
            }
            throw e;
        }

    } catch (error) {
        console.error("======================================");
        console.error("[GEMINI ERROR] Analysis Failed");
        console.error("Time:", new Date().toISOString());
        console.error("File:", filePath);

        if (error.status === 429 || (error.message && error.message.includes("429"))) {
            console.error("ERROR TYPE: RATE LIMIT EXCEEDED (429)");
            console.error("Suggestion: Wait for 30-60 seconds before retrying.");
        } else {
            console.error("Error Message:", error.message);
            if (error.status) console.error("Error Status:", error.status);
            if (error.statusText) console.error("Error StatusText:", error.statusText);
            if (error.errorDetails) console.error("Error Details:", JSON.stringify(error.errorDetails, null, 2));
            // Log full error object for granular details including 'cause'
            console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
        console.error("======================================");

        throw error;
    }
}

module.exports = { extractDataWithGemini };
