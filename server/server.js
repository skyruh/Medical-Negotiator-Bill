const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { extractDataWithGemini } = require("./services/gemini");
const { findRate } = require("./services/cghs");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

const performAnalysis = (extractedData, city) => {
    const analysis = {
        ...extractedData,
        comparison: {
            total_bill_amount: extractedData.total_amount,
            cghs_total_amount: 0, // Deprecated conceptually, will now represent "Sum of Rates"
            total_fair_amount: 0, // NEW: The amount the user SHOULD pay
            total_overpaid: 0,
            items: []
        },
        metadata: {
            city: city, // Include city in response for debugging/UI
            tier_multiplier: 1.0 // Placeholder
        }
    };

    if (extractedData.line_items) {
        extractedData.line_items.forEach(item => {
            // Pass CITY to findRate
            let cghsMatch = findRate(item.code, item.normalized_name, city);

            // Fallback match using description
            if (!cghsMatch && item.description && item.description !== item.normalized_name) {
                console.log(`[Analysis] Fallback match using description for: ${item.description}`);
                cghsMatch = findRate(item.code, item.description, city);
            }

            let cghsRate = null;
            let status = "Not Found";
            let variance = 0;
            let fairPrice = 0; // Price specific to this item

            if (cghsMatch) {
                // FORCE NUMERIC CONVERSION to avoid string comparison bugs
                cghsRate = Number(cghsMatch.rate);

                // Ensure item price is also a number
                const itemPrice = Number(item.total_price);

                // Use the LOWER of the two prices as the "Fair Price"
                // If Bill is 400 and Rate is 800, Fair is 400.
                // If Bill is 800 and Rate is 560, Fair is 560.
                fairPrice = Math.min(itemPrice, cghsRate);

                if (itemPrice > cghsRate) {
                    variance = itemPrice - cghsRate;
                    status = "Overpaid";
                    analysis.comparison.total_overpaid += variance;
                } else {
                    status = ""; // User requested to remove "Within Limit"
                    // If underpaying, variance is 0 for "Overpayment" metric
                }
                analysis.comparison.cghs_total_amount += cghsRate;

            } else {
                // Not Found => Fair Price is the Bill Price (we assume it's allowed if no rate found)
                // Or should we flag it? Current logic accepted it.
                cghsRate = Number(item.total_price);
                fairPrice = cghsRate;
                status = "Not Found (Allowed)";
                variance = 0;
                analysis.comparison.cghs_total_amount += cghsRate;
            }

            analysis.comparison.total_fair_amount += fairPrice;

            analysis.comparison.items.push({
                code: item.code,
                description: item.description,
                normalized_name: item.normalized_name, // Preserve this
                category: item.category,               // Preserve this
                quantity: item.quantity,               // Preserve this
                unit_price: item.unit_price,           // Preserve this
                total_price: item.total_price,         // Needs to be here for re-analysis
                bill_price: item.total_price,
                cghs_rate: cghsRate,
                cghs_name: cghsMatch ? cghsMatch.name : null,
                status: status,
                variance: variance
            });
        });
    }
    return analysis;
};

app.post("/api/analyze", upload.single("bill"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    try {
        console.log(`Analyzing file: ${req.file.originalname}`);

        // 1. Extract data using Gemini
        const extractedData = await extractDataWithGemini(filePath, req.file.mimetype);

        // 2. Compare with CGHS Rates
        const city = req.body.city || "Delhi"; // Default to Delhi (Tier 1) if unspecified
        const analysis = performAnalysis(extractedData, city);

        // Cleanup file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        res.json(analysis);

    } catch (error) {
        console.error("Analysis failed:", error.message);

        // Handle Rate Limiting specifically
        if (error.message.includes("429") || error.status === 429) {
            return res.status(429).json({
                error: "System Busy (Rate Limit)",
                details: "We received too many requests. Please wait 30 seconds and try again."
            });
        }

        res.status(500).json({ error: "Analysis failed", details: error.message });

        // Try cleanup even on error
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, () => { });
        }
    }
});

app.post("/api/reanalyze", async (req, res) => {
    try {
        const { line_items, total_amount, city, ...otherData } = req.body;
        console.log("Re-analyzing data..." + (city ? ` for city: ${city}` : ""));

        // Construct the data object expected by performAnalysis
        // We ensure numerical values are actually numbers
        const inputData = {
            total_amount: Number(total_amount),
            line_items: line_items.map(item => ({
                ...item,
                total_price: Number(item.bill_price || item.total_price), // User edits bill_price usually
                // Ensure other fields are present if needed
            })),
            ...otherData
        };

        const analysis = performAnalysis(inputData, city);
        res.json(analysis);

    } catch (error) {
        console.error("Re-analysis failed:", error);
        res.status(500).json({ error: "Re-analysis failed", details: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});
