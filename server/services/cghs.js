const fs = require("fs");
const path = require("path");

let cghsRates = [];

function loadRates() {
    try {
        const dataPath = path.join(__dirname, "../data/cghs_rates.json");
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, "utf8");
            cghsRates = JSON.parse(data);
            console.log(`[CGHS] Loaded ${cghsRates.length} rates.`);
        } else {
            console.warn("[CGHS] Rates file not found. Using empty rates.");
        }
    } catch (error) {
        console.error("[CGHS] Error loading rates:", error);
    }
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function findRate(itemCode, itemName) {
    if (!itemCode && !itemName) return null;
    if (cghsRates.length === 0) return null;

    // 1. Try Code Match
    if (itemCode) {
        const codeMatch = cghsRates.find(r => r.code && r.code.toLowerCase() === itemCode.toLowerCase());
        if (codeMatch) return codeMatch;
    }

    if (!itemName) return null;

    const normalizedItem = itemName.toLowerCase().replace(/\s+/g, ' ').replace(/[.]+$/, '').trim();

    // 2. Bidirectional Substring Match
    // Matches if "CBC" is in "Complete Haemogram/CBC" OR "Complete Haemogram/CBC" is in "CBC" (unlikely)
    // We prioritize the longest matching rate name to avoid matching "Blood" to "Blood Sugar"
    const substringMatches = cghsRates.filter(r => {
        const rateName = r.name.toLowerCase();
        return normalizedItem.includes(rateName) || rateName.includes(normalizedItem);
    });

    if (substringMatches.length > 0) {
        // Sort by length - longest match is usually the most specific and correct one
        substringMatches.sort((a, b) => b.name.length - a.name.length);
        return substringMatches[0];
    }

    // 3. Fuzzy Name Match
    let bestMatch = null;
    let minDistance = Infinity;
    const threshold = 5;

    for (const rate of cghsRates) {
        const rateName = rate.name.toLowerCase();
        // Skip completely different length strings to save time
        if (Math.abs(rateName.length - normalizedItem.length) > 10) continue;

        const dist = levenshtein(normalizedItem, rateName);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = rate;
        }
    }

    if (minDistance <= threshold) {
        return bestMatch;
    }

    return null;
}

// Initialize on load
loadRates();

module.exports = { findRate, loadRates };
