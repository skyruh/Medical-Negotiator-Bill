const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in server/.env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function main() {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
        }
    });
    const filePath = "c:/Users/shiva/Desktop/inn2 - Copy (2)/Scanned Image.pdf";

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        process.exit(1);
    }

    console.log("Uploading file...");
    const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: "application/pdf",
        displayName: "CGHS Data PDF",
    });
    console.log(`File uploaded: ${uploadResult.file.uri}`);

    let file = await fileManager.getFile(uploadResult.file.name);
    process.stdout.write("Processing");
    while (file.state === "PROCESSING") {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        file = await fileManager.getFile(uploadResult.file.name);
    }
    process.stdout.write("\n");

    if (file.state === "FAILED") {
        throw new Error("File processing failed.");
    }
    console.log(`File ready: ${file.uri}`);


    const prompt = `
    You are an expert data extractor.
    Extract all medical procedure codes, names, and non-NABH rates from this CGHS document.
    Return a JSON array where each object has:
    - "code": string (Procedure Code, e.g. "1", "55")
    - "name": string (Procedure Name)
    - "rate": number (Non-NABH Rate)

    Important:
    - The document contains columns for "Sr. No.", "Treatment Procedure/Investigation", "Non-NABH / Non-NABL Rates", "NABH / NABL Rates".
    - EXTRACT ONLY the "Non-NABH / Non-NABL Rates".
    - Handle merged cells or multi-line descriptions by combining them intelligently.
    - If rate is "-" or empty, assume 0 or null.
    - Output ONLY valid JSON.
  `;

    console.log("Generating content...");
    const result = await model.generateContent([
        {
            fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri
            }
        },
        { text: prompt }
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const outputDir = path.join(__dirname, "../data");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Attempt to parse or repair
    try {
        JSON.parse(text);
    } catch (e) {
        console.warn("Full JSON parse failed, attempting repair...");
        // Try to find the largest valid JSON array
        const firstBracket = text.indexOf("[");
        if (firstBracket !== -1) {
            // If it didn't end with ], try to append one
            if (!text.endsWith("]")) {
                const lastBrace = text.lastIndexOf("}");
                if (lastBrace !== -1) {
                    text = text.substring(firstBracket, lastBrace + 1) + "]";
                }
            }
        }

        try {
            JSON.parse(text);
            console.log("JSON repaired successfully.");
        } catch (e2) {
            console.error("JSON repair failed. Saving raw text to cghs_rates_raw.txt");
            fs.writeFileSync(path.join(outputDir, "cghs_rates_raw.txt"), text);
            // Don't exit, still try to save what we have if possible? 
            // Actually, if it's not valid JSON, saving it dynamically as .json is bad for the server.
            // But we saving raw text is good.
            process.exit(1);
        }
    }

    const outputPath = path.join(outputDir, "cghs_rates.json");
    fs.writeFileSync(outputPath, text);
    console.log("Rates saved to " + outputPath);
}

main().catch(console.error);
