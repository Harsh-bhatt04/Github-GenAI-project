import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import chatRoutes from "./routes/chatRoutes.js"
import repoRoutes from "./routes/repoRoutes.js";
import embedding from "./config/embeddings.js"

const app = express()
const PORT = process.env.PORT || 5000
console.log(process.env.GOOGLE_API_KEY);
console.log(process.env.PINECONE_API_KEY);

app.use(cors())
app.use(express.json())
const testEmbedding = async ()=>{
    const vector = await embedding.embedQuery("hello world")
    console.log("Vector length: ", vector.length);
    
}
testEmbedding()

app.use("/api",chatRoutes)
app.use("/repo", repoRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`)
})

