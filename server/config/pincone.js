import env from './env.js'
import { Pinecone } from '@pinecone-database/pinecone'

if (!env.PINECONE_API_KEY) {
  throw new Error(
    'Missing PINECONE_API_KEY. Copy server/.env.example to server/.env and set PINECONE_API_KEY.'
  )
}

if (!env.PINECONE_INDEX) {
  throw new Error(
    'Missing PINECONE_INDEX. Copy server/.env.example to server/.env and set PINECONE_INDEX.'
  )
}

const parsePineconeIndexConfig = (value) => {
  if (!value) return { indexName: '' }
  const rawValue = value.trim()

  try {
    const url = new URL(rawValue)
    const host = `${url.protocol}//${url.hostname}`
    const path = url.pathname.replace(/^\/|\/$/g, '')
    return {
      indexName: path || url.hostname.split('.')[0],
      controllerHostUrl: host,
    }
  } catch {
    return {
      indexName: rawValue,
    }
  }
}

const parsedIndexConfig = parsePineconeIndexConfig(env.PINECONE_INDEX)
const pineconeConfig = {
  apiKey: env.PINECONE_API_KEY,
}

if (env.PINECONE_CONTROLLER_HOST) {
  pineconeConfig.controllerHostUrl = env.PINECONE_CONTROLLER_HOST.trim()
} else if (parsedIndexConfig.controllerHostUrl) {
  pineconeConfig.controllerHostUrl = parsedIndexConfig.controllerHostUrl
}

const indexName = parsedIndexConfig.indexName
if (!indexName) {
  throw new Error(
    'Unable to parse PINECONE_INDEX. Use either the index name or a full Pinecone index URL in server/.env.'
  )
}

const pinecone = new Pinecone(pineconeConfig)
const index = pinecone.Index(indexName)
console.log(`Executed pinecone.js with index: ${indexName}`)
if (pineconeConfig.controllerHostUrl) {
  console.log(`Using Pinecone controller host: ${pineconeConfig.controllerHostUrl}`)
}

export default index