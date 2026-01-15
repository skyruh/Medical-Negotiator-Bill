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

const TIER_1_CITIES = [
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad", "Pune", "Ahmedabad"
];

const TIER_2_CITIES = [
    "Agra", "Ajmer", "Allahabad", "Amritsar", "Aurangabad", "Bareilly", "Bhopal", "Bhubaneswar",
    "Chandigarh", "Coimbatore", "Dehradun", "Dhanbad", "Faridabad", "Ghaziabad", "Gurugram",
    "Guwahati", "Gwalior", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jodhpur",
    "Kanpur", "Kochi", "Kozhikode", "Lucknow", "Ludhiana", "Madurai", "Meerut", "Moradabad",
    "Mysuru", "Nagpur", "Noida", "Patna", "Raipur", "Ranchi", "Shimla", "Siliguri", "Srinagar",
    "Surat", "Thiruvananthapuram", "Thrissur", "Trichy", "Udaipur", "Vadodara", "Varanasi",
    "Vijayawada", "Visakhapatnam"
];

function getCityTierMultiplier(city) {
    if (!city) return 1.0; // Default to Tier 1 if no city provided

    // Normalize city name for comparison
    const normalizedCity = city.trim();
    // Case-insensitive check could be added if needed, but lists are Title Case.
    // Let's use exact match for now as per list, but maybe ignore case?
    // Safety:
    const cityLower = normalizedCity.toLowerCase();

    if (TIER_1_CITIES.some(c => c.toLowerCase() === cityLower)) {
        return 1.0;
    }
    if (TIER_2_CITIES.some(c => c.toLowerCase() === cityLower)) {
        return 0.9;
    }
    // Tier 3 Rule: Any CGHS-covered city not in Tier 1 or Tier 2
    return 0.8;
}

function findRate(itemCode, itemName, city) {
    if (!itemCode && !itemName) return null;
    if (cghsRates.length === 0) return null;

    let baseMatch = null;

    // 1. Try Code Match
    if (itemCode) {
        baseMatch = cghsRates.find(r => r.code && r.code.toLowerCase() === itemCode.toLowerCase());
    }

    // 2. Try Name Match if no Code Match
    if (!baseMatch && itemName) {
        const normalizedItem = itemName.toLowerCase().replace(/\s+/g, ' ').replace(/[.]+$/, '').trim();

        // Bidirectional Substring Match
        const substringMatches = cghsRates.filter(r => {
            const rateName = r.name.toLowerCase();
            // SAFETY: Ignore very short rate names for substring matching to prevent false positives like "A", "By"
            if (rateName.length < 3) return false;

            const match = normalizedItem.includes(rateName) || rateName.includes(normalizedItem);
            return match;
        });

        if (substringMatches.length > 0) {
            // Sort by length - longest match is usually the most specific and correct one
            substringMatches.sort((a, b) => b.name.length - a.name.length);
            baseMatch = substringMatches[0];
            console.log(`[CGHS Match] Substring Match: "${normalizedItem}" matched "${baseMatch.name}"`);
        }

        // Fuzzy Name Match Fallback
        if (!baseMatch) {
            let bestFuzzyMatch = null;
            let minDistance = Infinity;
            const threshold = 5;

            for (const rate of cghsRates) {
                const rateName = rate.name.toLowerCase();
                if (Math.abs(rateName.length - normalizedItem.length) > 10) continue;

                const dist = levenshtein(normalizedItem, rateName);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestFuzzyMatch = rate;
                }
            }

            if (minDistance <= threshold) {
                baseMatch = bestFuzzyMatch;
                console.log(`[CGHS Match] Fuzzy Match: "${normalizedItem}" matched "${baseMatch.name}" (Dist: ${minDistance})`);
            }
        }
    }

    if (!baseMatch) return null;

    // Apply Tier Logic
    const multiplier = getCityTierMultiplier(city);

    // Clone the object to avoid mutating the global list and return adjusted rate
    return {
        ...baseMatch,
        rate: Math.round(baseMatch.rate * multiplier), // Round to nearest integer standard
        original_rate: baseMatch.rate,
        tier_multiplier: multiplier,
        tier_city: city || "Default (Tier 1)"
    };
}

// Initialize on load
loadRates();

module.exports = { findRate, loadRates, TIER_1_CITIES, TIER_2_CITIES };
