import 'dotenv/config'

const requiredVars = ['GOOGLE_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX']
const missingVars = requiredVars.filter((key) => !process.env[key])

if (missingVars.length > 0) {
  console.warn(`\n[server/config/env.js] Missing environment variables: ${missingVars.join(', ')}\n`)
  console.warn('Copy server/.env.example to server/.env and add the missing values before using AI features. The server will still start, but endpoints will return a clear error.')
}

const env = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
  PINECONE_CONTROLLER_HOST: process.env.PINECONE_CONTROLLER_HOST,
  PORT: process.env.PORT || 5000,
}

export default env
