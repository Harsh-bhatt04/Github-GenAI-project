import express from "express"
import { chat } from "../controllers/chatController.js"

const router = express.Router()

router.post("/chat",chat)
console.log("Executed chatRoutes.js")
export default router