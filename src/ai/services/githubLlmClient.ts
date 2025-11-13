// src/ai/services/githubLlmClient.ts
import ModelClient, { isUnexpected, ChatCompletionsOutput } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = import.meta.env.VITE_GITHUB_TOKEN as string;
const endpoint = import.meta.env.VITE_GITHUB_ENDPOINT as string;
const model = import.meta.env.VITE_GITHUB_MODEL as string;

console.log("GitHub Models Config:", { token: !!token, endpoint, model });

if (!token || !endpoint || !model) {
  throw new Error("Missing GitHub Models env vars");
}

const client = ModelClient(endpoint, new AzureKeyCredential(token));

const SYSTEM_PROMPT = `
You are an AI assistant for Kerides, a Kerala ride-booking app.
Extract origin and destination from the user's speech.
Return ONLY valid JSON: {"origin":"…","destination":"…"}
Never add explanations.
`;

export interface ParsedLocation {
  origin: string;
  destination: string;
}

export async function parseVoiceWithLlm(text: string): Promise<ParsedLocation> {
  console.log("LLM INPUT:", text);

  for (let attempt = 0; attempt < 3; attempt++) {
    console.log(`LLM Attempt ${attempt + 1}/3`);

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 100,
        model,
      },
    });

    console.log("LLM Raw Response:", response);

    if (!isUnexpected(response)) {
      const body = response.body as ChatCompletionsOutput;
      const raw = body.choices?.[0]?.message?.content ?? "";
      console.log("LLM Raw Output:", raw);

      if (!raw) {
        console.error("Empty LLM response");
        continue;
      }

      try {
        const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, "").trim();
        console.log("LLM Cleaned JSON:", cleaned);
        const result = JSON.parse(cleaned) as ParsedLocation;
        console.log("LLM Parsed Result:", result);
        return result;
      } catch (e) {
        console.error("JSON Parse Failed:", e);
      }
    } else {
      console.error("LLM API Error:", response.status, response.body);
    }

    // if (response.status === 429 && attempt < 2) {
    //   console.log("Rate limited, waiting 2s...");
    //   await new Promise((r) => setTimeout(r, 2000));
    //   continue;
    // }

    type ErrorResponse = { error?: { message?: string } };
    const errBody = response.body as ErrorResponse;
    const err = errBody.error?.message ?? "Unknown error";
    throw new Error(err);
  }
  throw new Error("LLM failed after 3 retries");
}