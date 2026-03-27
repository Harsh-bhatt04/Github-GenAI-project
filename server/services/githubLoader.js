import axios from "axios";
import { Document } from "@langchain/core/documents";

// Allowed file types to avoid huge binaries
const allowedExtensions = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".md", ".json",".html",".htm"];

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
export const loadGithubRepo = async (owner, repo) => {
  try {
    // ===================== UPDATED PART =====================
    // Fetch the entire repo tree recursively in ONE API call
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
    console.log("Fetching repo tree from:", treeUrl); // debug log
    const treeRes = await axios.get(treeUrl);
    const tree = treeRes.data.tree; // contains all files and paths
    // ==========================================================

    // ===================== UPDATED PART =====================
    // Filter only allowed file types and blobs (ignore folders)
    const files = tree.filter(
      f =>
        f.type === "blob" &&
        allowedExtensions.some(ext => f.path.endsWith(ext)) &&
        f.size < 100000 // skip files larger than 100 KB
    );
    // ==========================================================

    // ===================== UPDATED PART =====================
    // Fetch content of all filtered files in parallel (with safety)
    const documents = await Promise.all(
      files.map(async file => {
        // raw.githubusercontent URL to get file content
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file.path}`;
        const contentRes = await axios.get(rawUrl);
        return new Document({
          pageContent: contentRes.data,
          metadata: { source: file.path } // keep file path for context
        });
      })
    );
    // ==========================================================

    console.log(`Loaded ${documents.length} documents from ${owner}/${repo}`);
    return documents;
  } catch (error) {
    console.error("Error loading GitHub repo:", error.message);
    throw new Error(error.message);
  }
};