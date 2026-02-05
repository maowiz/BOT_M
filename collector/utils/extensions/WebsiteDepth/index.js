const { v4 } = require("uuid");
const { default: slugify } = require("slugify");
const { writeToServerDocuments } = require("../../files");
const { tokenizeString } = require("../../tokenizer");
const path = require("path");
const fs = require("fs");

/**
 * Crawl4AI Service Integration
 * Replaces Puppeteer with a call to the local python crawl service.
 */
async function scrapper(startUrl, depth = 1, maxLinks = 20) {
  const websiteName = new URL(startUrl).hostname;
  const outFolder = slugify(
    `${slugify(websiteName)}-${v4().slice(0, 4)}`
  ).toLowerCase();

  // Resolve output path based on environment similar to original code
  const outFolderPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(
        __dirname,
        `../../../../server/storage/documents/${outFolder}`
      )
      : path.resolve(process.env.STORAGE_DIR, `documents/${outFolder}`);

  if (!fs.existsSync(outFolderPath)) {
    fs.mkdirSync(outFolderPath, { recursive: true });
  }

  console.log(`[Crawl4AI] Starting crawl for ${startUrl} (Depth: ${depth}, Max: ${maxLinks})`);

  try {
    // Call the Python Service
    const response = await fetch("http://127.0.0.1:11235/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: startUrl,
        depth: depth,
        max_pages: maxLinks,
        bypass_cache: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Crawl service returned status: ${response.status}`);
    }

    const result = await response.json();
    const pages = result.pages || [];

    console.log(`[Crawl4AI] Received ${pages.length} pages from service.`);
    const scrapedData = [];

    for (const page of pages) {
      if (!page.markdown || page.markdown.length === 0) continue;

      const urlObj = new URL(page.url);
      const decodedPathname = decodeURIComponent(urlObj.pathname);
      const filename = `${urlObj.hostname}${decodedPathname.replace(/\//g, "_")}`;
      const safeFilename = slugify(filename) + ".md"; // Saving as .md for better readability

      const data = {
        id: v4(),
        url: "file://" + safeFilename,
        title: page.title || safeFilename,
        docAuthor: "Crawl4AI Bot",
        description: "Crawled content from " + page.url,
        docSource: "Crawl4AI Web Scraper",
        chunkSource: `link://${page.url}`,
        published: new Date().toLocaleString(),
        wordCount: page.markdown.split(" ").length,
        pageContent: page.markdown,
        token_count_estimate: tokenizeString(page.markdown),
        contentHash: page.content_hash,
      };

      writeToServerDocuments({
        data,
        filename: data.title,
        destinationOverride: outFolderPath,
      });

      scrapedData.push(data);
    }

    console.log(`[Crawl4AI] Successfully saved ${scrapedData.length} documents.`);
    return scrapedData;

  } catch (error) {
    console.error("[Crawl4AI] Crawl failed:", error);
    return [];
  }
}

module.exports = scrapper;
