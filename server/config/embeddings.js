import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embedding = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
  });
console.log("Embedding model configured");
console.log("GOOGLE KEY:", process.env.GOOGLE_API_KEY)
export default embedding