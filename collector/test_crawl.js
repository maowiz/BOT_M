// Set ENV vars BEFORE requiring modules that use them at top-level
process.env.STORAGE_DIR = process.env.STORAGE_DIR || "../../server/storage";
process.env.NODE_ENV = "development";

const websiteScraper = require("./utils/extensions/WebsiteDepth/index.js");
require('dotenv').config();

async function test() {
    console.log("Testing Crawl4AI Integration...");
    try {
        // Mock environment if needed
        process.env.STORAGE_DIR = process.env.STORAGE_DIR || "../../server/storage";

        const results = await websiteScraper("https://example.com", 1, 5);
        console.log("FINAL RESULTS:", JSON.stringify(results, null, 2));
    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

test();
