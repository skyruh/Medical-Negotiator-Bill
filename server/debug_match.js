const { findRate, loadRates } = require("./services/cghs");
const fs = require('fs');

// Force load rates
loadRates();

const testItems = [
    { name: "Stool for Occult Blood", code: null },
    { name: "Vitamin B12 Assay", code: null },
    { name: "Vitamin B12 Assay.", code: null },
    { name: "Stool  for Occult Blood", code: null }, // Double space
    { name: "Stool for Occult Blood ", code: null }, // Trailing space (should work)
    { name: "Stool for\nOccult Blood", code: null }, // Newline
    { name: "Vitamin B 12 Assay", code: null }, // Split B 12
    { name: "  Stool for Occult Blood  ", code: null }
];

const logStream = fs.createWriteStream("debug_log.txt");

function log(msg) {
    console.log(msg);
    logStream.write(msg + "\n");
}

log("--- Starting Match Debug ---");

testItems.forEach(item => {
    log(`\nTesting: "${item.name}"`);
    const result = findRate(item.code, item.name);
    if (result) {
        log(`✅ MATCH: "${result.name}" (Code: ${result.code}, Rate: ${result.rate})`);
    } else {
        log(`❌ NO MATCH`);
        // Debug why
        const normalizedItem = item.name.toLowerCase().trim();
        log(`   Normalized Input: '${normalizedItem}'`);
        // Check "Stool for Occult Blood" specifically in DB
        const rates = require("./data/cghs_rates.json");
        const candidates = rates.filter(r => r.name.toLowerCase().includes("blood"));
        log(`   Candidates with 'blood': ${candidates.length}`);
        candidates.forEach(c => {
            const dbName = c.name.toLowerCase();
            const inc = dbName.includes(normalizedItem);
            log(`      DB: '${dbName}' includes input? ${inc}`);
            if (dbName.includes("stool for occult")) {
                log(`      Debug Compare: '${dbName}' vs '${normalizedItem}'`);
                log(`      DB Chars: ${[...dbName].map(c => c.charCodeAt(0))}`);
                log(`      In Chars: ${[...normalizedItem].map(c => c.charCodeAt(0))}`);
            }
        });
    }
});

log("\n--- Debug Complete ---");
logStream.end();
