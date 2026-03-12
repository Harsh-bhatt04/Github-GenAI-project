import axios from "axios";
import { Document } from "@langchain/core/documents";

export const loadGithubRepo = async (owner, repo) => {
    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents`
    )
    const files = response.data
    const documents = []

    for (const file of files) {

    // ignore directories
    if (file.type !== "file" || !file.download_url) continue;

    const content = await axios.get(file.download_url);

    documents.push(
      new Document({
        pageContent: content.data,
        metadata: {
          source: file.name
        }
      })
    );

  }

    return documents
}