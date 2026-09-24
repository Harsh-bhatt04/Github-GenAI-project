import env from './env.js'
import {ChatGoogleGenerativeAI} from "@langchain/google-genai"

if (!env.GOOGLE_API_KEY) {
  throw new Error(
    'Missing GOOGLE_API_KEY. Copy server/.env.example to server/.env and set GOOGLE_API_KEY.'
  )
}

const model = new ChatGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.3,
})
console.log("Executed gemini.js")
export default model