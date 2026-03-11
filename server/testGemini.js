import model from "./config/gemini.js";

const run = async ()=>{
    const res = await model.invoke("what is MERN stack")
    console.log(res.content)
}
run()