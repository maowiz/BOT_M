const websiteScraper = require("./collector/utils/extensions/WebsiteDepth/index.js");
require('dotenv').config({ path: './collector/.env' }); // Load env for STORAGE_DIR if needed

async function test() {
    console.log("Testing Crawl4AI Integration...");
    try {
        const results = await websiteScraper("https://example.com", 1, 5);
        console.log("FINAL RESULTS:", JSON.stringify(results, null, 2));
    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

test();
