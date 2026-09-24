import { PineconeStore } from '@langchain/pinecone'
import embedding from '../config/embeddings.js'
import index from '../config/pincone.js'
import model from '../config/gemini.js'

export const askQuestion = async (question, namespace) => {
  console.log('Executing askQuestion in ragServices.js')
  console.log('namespace:', namespace)

  const vectorStore = await PineconeStore.fromExistingIndex(
    embedding,
    {
      pineconeIndex: index,
      namespace,
    }
  )

  const retriever = vectorStore.asRetriever({ k: 5 })

  const docs = Array.isArray(retriever.getRelevantDocuments)
    ? await retriever.getRelevantDocuments(question)
    : await retriever.invoke(question)

  if (!Array.isArray(docs)) {
    console.error('Retriever returned non-array result:', docs)
    throw new Error('Unable to retrieve repository context. Please try again.')
  }

  console.log('Retrieved docs count:', docs.length)
  console.log('DOCSSS:', docs)

  if (!docs.length) {
    throw new Error(
      'No context found for this namespace. Ingest a repository first, or confirm the namespace is correct.'
    )
  }

  const context = docs
    .map(
      (doc) =>
        `File: ${doc.metadata?.source || 'unknown'}\n${doc.pageContent}`
    )
    .join('\n\n')

    

  const prompt = `You are a helpful AI assistant for GitHub repositories. Answer the question using only the repository context below. Keep the answer concise and conversational.

Repository content:
${context}

Question:
${question}

If the repository content does not answer the question, say: "I don't know enough from the repository content."`

  const response = await model.invoke(prompt)
  console.log('Model response:', response)
  console.log('Executed ragservices.js')
  const answer = typeof response?.content === 'string' ? response.content : response?.content?.[0]?.text
  return answer?.trim() ?? ''
}

