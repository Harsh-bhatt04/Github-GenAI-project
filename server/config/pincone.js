import {Pinecone} from "@pinecone-database/pinecone"

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
})

const index = pinecone.Index(process.env.PINECONE_INDEX)
console.log("Executed pinecone.js")

export default index