/**
 * RAG-Optimized Workspace Seed Script
 * 
 * Run this after AnythingLLM server starts to create
 * an optimized workspace for accurate RAG chatbots.
 * 
 * Usage: node create_optimized_workspace.js
 */

const WORKSPACE_NAME = "Crawl4AI Bot";
const API_BASE = "http://localhost:3001/api";

const OPTIMIZED_SETTINGS = {
    name: WORKSPACE_NAME,
    // System prompt for strict RAG behavior
    openAiPrompt: `You are a helpful assistant that answers questions ONLY using the provided context.

RULES:
1. Answer ONLY using information from the context below.
2. If the context does not contain the answer, say: "I don't have that information in the knowledge base."
3. NEVER make up or infer information not explicitly stated in the context.
4. Cite your sources by mentioning the page title or URL when possible.
5. Be concise and direct.

CONTEXT:
{context}`,

    // Retrieval settings (optimized)
    topN: 8,                    // Retrieve 8 chunks (good balance)
    similarityThreshold: 0.25,  // Keep default (lower = more results)
    chatMode: "chat",           // Use chat mode
    openAiHistory: 10,          // Keep last 10 messages for context
    openAiTemp: 0.2,            // Low temperature for factual answers
};

async function createWorkspace() {
    console.log("🚀 Creating optimized RAG workspace...");

    try {
        const response = await fetch(`${API_BASE}/workspace/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(OPTIMIZED_SETTINGS),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create workspace: ${error}`);
        }

        const data = await response.json();
        console.log("✅ Workspace created:", data.workspace?.name);
        console.log("   Slug:", data.workspace?.slug);
        console.log("   TopN:", OPTIMIZED_SETTINGS.topN);
        console.log("   Temperature:", OPTIMIZED_SETTINGS.openAiTemp);
        console.log("");
        console.log("📝 System prompt configured for strict RAG behavior");
        console.log("🎯 Ready for document ingestion!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

createWorkspace();
