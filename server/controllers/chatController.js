import { askQuestion } from "../services/ragServices.js";

export const chat = async (req,res) =>{
    try{
        const {question} = req.body
        const answer = await askQuestion(question)

        res.json({
            answer
        })
    }
    catch(err){
        console.log(`Error : ${err.message}`)
        res.status(500).json({
            error: err.message
        })
    }
}