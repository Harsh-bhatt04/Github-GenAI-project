import { askQuestion } from "../services/ragServices.js";

export const chat = async (req,res) =>{
    try{
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Transfer-Encoding', 'chunked')
        const { question, namespace } = req.body
        const stream = askQuestion(question, namespace)

        for await (const chunk of stream) {
        console.log('CHUNK:', chunk)
        res.write(chunk)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        res.end()
    }
    catch(err){
        console.log(`Error : ${err.message}`)
        res.status(500).json({
            error: err.message
        })
    }
}