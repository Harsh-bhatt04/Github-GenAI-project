import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embedding = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'text-embedding-004',
  });
console.log("Embedding model configured");

export default embedding