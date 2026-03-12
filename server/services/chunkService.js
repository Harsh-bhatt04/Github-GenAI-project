import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"

export const splitDocuments = async (documents)=>{
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    })

    return await splitter.splitDocuments(documents)
}