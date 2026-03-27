import embedding from "../config/embeddings.js";
import index from "../config/pincone.js";
import { PineconeStore } from "@langchain/pinecone";

export const ingestionDocuments = async (chunks,namespace)=>{

    //  const namespace = `repo-${repoName}`; 
     console.log("Using namespace:", namespace);

    await PineconeStore.fromDocuments(
        chunks,
        embedding,
        {
            pineconeIndex: index,
            namespace
        }
    )
    console.log("New documents ingested into Pinecone index under namespace:", namespace);
}