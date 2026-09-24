import axios from "axios";
import { Document } from "@langchain/core/documents";

// Allowed file types to avoid huge binaries
const allowedExtensions = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".md", ".json", ".html", ".htm"];
const allowedFilenames = ["README", "README.md", "README.markdown", "LICENSE", "CHANGELOG"];

/**
 * Load a GitHub repository into LangChain Documents.
 * This is a production-grade loader:
 * - Fetches the full repo tree in 1 API call
 * - Filters only relevant small files
 * - Avoids recursion and extra API calls
 *
 * @param {string} owner - GitHub repo owner
 * @param {string} repo - GitHub repo name
 * @returns {Document[]} documents - array of LangChain Documents
 */
const normalizeRepoName = (owner, repo) => {
  const ownerTrimmed = owner?.trim() ?? ''
  const repoTrimmed = repo?.trim() ?? ''

  if (!ownerTrimmed || !repoTrimmed) {
    throw new Error('GitHub owner and repo are required for loading repository contents.')
  }

  return { owner: ownerTrimmed, repo: repoTrimmed }
}

const isAllowedFile = (path, size) => {
  const normalizedPath = path.trim()
  const fileName = normalizedPath.split('/').pop()

  const hasAllowedExtension = allowedExtensions.some((ext) => normalizedPath.toLowerCase().endsWith(ext))
  const isAllowedName = allowedFilenames.some((name) => fileName.toLowerCase() === name.toLowerCase())

  return (
    size < 100000 &&
    (hasAllowedExtension || isAllowedName)
  )
}

export const loadGithubRepo = async (owner, repo) => {
  const { owner: normalizedOwner, repo: normalizedRepo } = normalizeRepoName(owner, repo)

  try {
    const treeUrl = `https://api.github.com/repos/${normalizedOwner}/${normalizedRepo}/git/trees/HEAD?recursive=1`
    console.log('Fetching repo tree from:', treeUrl)
    const treeRes = await axios.get(treeUrl)
    const tree = treeRes.data.tree

    const files = tree.filter(
      (f) => f.type === 'blob' && isAllowedFile(f.path, f.size),
    )

    if (!files.length) {
      console.log('No allowed files found. Repo tree items:', tree.map((f) => f.path))
    }

    const documents = await Promise.all(
      files.map(async (file) => {
        const rawUrl = `https://raw.githubusercontent.com/${normalizedOwner}/${normalizedRepo}/HEAD/${file.path}`
        const contentRes = await axios.get(rawUrl)
        return new Document({
          pageContent: contentRes.data,
          metadata: { source: file.path },
        })
      }),
    )

    console.log(`Loaded ${documents.length} documents from ${normalizedOwner}/${normalizedRepo}`)
    return documents
  } catch (error) {
    console.error('Error loading GitHub repo:', error.message)
    if (error.response?.status === 404) {
      throw new Error('Repository not found. Please verify the owner and repository name.')
    }
    throw new Error(error.message)
  }
}
