import env from './env.js'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

if (!env.GOOGLE_API_KEY) {
  throw new Error(
    'Missing GOOGLE_API_KEY. Copy server/.env.example to server/.env and set GOOGLE_API_KEY.'
  )
}

const embedding = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

console.log("Embedding model configured")
export default embedding