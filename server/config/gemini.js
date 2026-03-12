import {ChatGoogleGenerativeAI} from "@langchain/google-genai"

const model = new ChatGoogleGenerativeAI({
    apiKey : process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.3
})
console.log("Executed gemini.js")
export default model