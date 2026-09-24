import { loadGithubRepo } from "../services/githubLoader.js";
import { splitDocuments } from "../services/chunkService.js";
import { ingestionDocuments } from "../services/ingestionService.js";

const parseGitHubRepo = (ownerValue, repoValue) => {
  const normalizeUrl = (value) => {
    try {
      const url = new URL(value)
      if (!url.hostname.includes('github.com')) return null
      const path = url.pathname.replace(/^\/|\/$/g, '')
      const [owner, repo] = path.split('/')
      return owner && repo ? { owner, repo } : null
    } catch {
      return null
    }
  }

  const owner = ownerValue?.trim() ?? ''
  const repo = repoValue?.trim() ?? ''

  if (repo && /^https?:\/\//.test(repo)) {
    return normalizeUrl(repo)
  }

  if (!repo && owner && /^https?:\/\//.test(owner)) {
    return normalizeUrl(owner)
  }

  if (!repo && owner.includes('/')) {
    const pieces = owner.split('/').filter(Boolean)
    if (pieces.length === 2) {
      return { owner: pieces[0], repo: pieces[1] }
    }
  }

  if (owner && repo) {
    return { owner, repo }
  }

  return null
}

export const ingestRepo = async (req, res) => {
  try {
    const { owner, repo } = req.body
    const parsed = parseGitHubRepo(owner, repo)

    if (!parsed) {
      return res.status(400).json({
        error: 'Please provide a valid GitHub owner/repo or repository URL.'
      })
    }

    const namespace = `session-${Date.now()}`
    console.log('Generated namespace:', namespace)
    console.log(`Ingesting repository: ${parsed.owner}/${parsed.repo}`)

    const documents = await loadGithubRepo(parsed.owner, parsed.repo)
    const chunks = await splitDocuments(documents)
    await ingestionDocuments(chunks, namespace)

    setTimeout(async () => {
      try {
        const index = (await import('../config/pincone.js')).default
        await index.delete({
          namespace,
          deleteAll: true,
        })
        console.log(`Cleaned namespace: ${namespace}`)
      } catch (err) {
        console.error('Cleanup error:', err.message)
      }
    }, 10 * 60 * 1000)

    res.json({
      message: 'Repository indexed successfully',
      chunks: chunks.length,
      namespace,
    })
  } catch (error) {
    const status = error.message.includes('Repository not found') ? 404 : 500
    res.status(status).json({ error: error.message })
  }
};