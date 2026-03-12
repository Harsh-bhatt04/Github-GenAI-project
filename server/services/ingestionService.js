import embedding from "../config/embeddings.js";
import index from "../config/pincone.js";
import { PineconeStore } from "@langchain/pinecone";

export const ingestionDocuments = async (chunks)=>{
    await PineconeStore.fromDocuments(
        chunks,
        embedding,
        {
            pineconeIndex: index
        }
    )
}