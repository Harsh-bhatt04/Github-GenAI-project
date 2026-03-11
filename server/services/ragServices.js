import {PineconeStore} from "@langchain/pinecone"
import embedding from "../config/embeddings.js"
import index from "../config/pincone.js"
import model from "../config/gemini.js"

export const askQuestion = async (question)=>{
    const vectorStore = await PineconeStore.fromExistingIndex(
        embedding,
        {pineconeIndex : index}
    )

    const retriever = vectorStore.asRetriever({
        k : 5
    })

    const docs = await retriever.invoke(question)
    const context = docs.map(doc => doc.pageContent).join("\n")

    const prompt = `You are a helpful assistant. 
    Context ${context}

    Question:
    ${question}

    answer clearly using the context.
    
    `

    const response = await model.invoke(prompt)
    console.log("Executed ragservices.js")
    return response.content
}

