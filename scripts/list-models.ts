// scripts/list-models.ts
/**
 * List all available Groq models for your API key
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/list-models.ts
 */

import OpenAI from "openai";

async function listModels() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("❌ GROQ_API_KEY not found");
        console.error("Make sure you pass --env-file=.env.local");
        process.exit(1);
    }

    console.log("🔑 Using API key:", apiKey.slice(0, 10) + "...");

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });

    try {
        const models = await client.models.list();
        console.log("\n✅ Available models:\n");
        models.data.forEach((model) => {
            console.log(`  - ${model.id}`);
        });
        console.log("\n");
    } catch (error: any) {
        console.error("❌ Error listing models:");
        console.error(error.message);
    }
}

listModels();
