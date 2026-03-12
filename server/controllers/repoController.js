import { loadGithubRepo } from "../services/githubLoader.js";
import { splitDocuments } from "../services/chunkService.js";
import { ingestionDocuments } from "../services/ingestionService.js";

export const ingestRepo = async (req, res) => {

  try {

    const { owner, repo } = req.body;

    const documents = await loadGithubRepo(owner, repo);

    const chunks = await splitDocuments(documents);

    await ingestionDocuments(chunks);

    res.json({
      message: "Repository indexed successfully",
      chunks: chunks.length
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};