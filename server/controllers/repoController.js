import { loadGithubRepo } from "../services/githubLoader.js";
import { splitDocuments } from "../services/chunkService.js";
import { ingestionDocuments } from "../services/ingestionService.js";

export const ingestRepo = async (req, res) => {
  try {

    // UPDATED PART 
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        error: "owner and repo are required"
      });
    }

    // Create unique session namespace
    const namespace = `session-${Date.now()}`;
    console.log("Generated namespace:", namespace);


    const documents = await loadGithubRepo(owner, repo);

    const chunks = await splitDocuments(documents);

    // UPDATED PART
    await ingestionDocuments(chunks, namespace);


    // UPDATED PART 
    // Optional auto-cleanup after 10 minutes
    setTimeout(async () => {
      try {
        const index = (await import("../config/pincone.js")).default;
        await index.delete({
          namespace,
          deleteAll: true
        });
        console.log(`Cleaned namespace: ${namespace}`);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    }, 10 * 60 * 1000); // 10 minutes

    res.json({
      message: "Repository indexed successfully",
      chunks: chunks.length,

      // UPDATED PART 
      namespace // send this to frontend
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};