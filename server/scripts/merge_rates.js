const fs = require("fs");
const path = require("path");

const currentRatesPath = path.join(__dirname, "../data/cghs_rates.json");
const newRatesPath = "c:/Users/shiva/Desktop/inn2 - Copy (2)/super_speciality_rates.json";

function mergeRates() {
    console.log("Reading current rates...");
    let currentRates = [];
    if (fs.existsSync(currentRatesPath)) {
        try {
            currentRates = JSON.parse(fs.readFileSync(currentRatesPath, "utf8"));
            if (!Array.isArray(currentRates)) currentRates = [];
        } catch (e) {
            console.warn("Could not read current rates, starting fresh.");
        }
    }

    console.log("Reading super speciality rates...");
    let newRatesRaw = {};
    if (fs.existsSync(newRatesPath)) {
        newRatesRaw = JSON.parse(fs.readFileSync(newRatesPath, "utf8"));
    } else {
        console.error("Super speciality rates file not found!");
        return;
    }

    // Convert current rates array to map for easy lookup
    const ratesMap = new Map();
    currentRates.forEach(r => {
        if (r.code) ratesMap.set(r.code, r);
    });

    let added = 0;
    let updated = 0;

    // Iterate over new rates object
    for (const [code, data] of Object.entries(newRatesRaw)) {
        // Use tier1_super as the standard rate for comparison
        const rateValue = data.tier1_super || 0;

        const newItem = {
            code: code,
            name: data.name,
            rate: rateValue,
            is_super_speciality: true
        };

        if (ratesMap.has(code)) {
            // Update existing? Or prefer existing?
            // Usually explicit new data is better. Let's update.
            ratesMap.set(code, newItem);
            updated++;
        } else {
            ratesMap.set(code, newItem);
            added++;
        }
    }

    const mergedList = Array.from(ratesMap.values());

    fs.writeFileSync(currentRatesPath, JSON.stringify(mergedList, null, 2));
    console.log(`Merge complete.`);
    console.log(`Total Items: ${mergedList.length}`);
    console.log(`Updated: ${updated}, Added: ${added}`);
}

mergeRates();
