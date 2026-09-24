const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const parseJson = async (response) => {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText || 'Unknown error from backend';
    throw new Error(message);
  }
  return body;
};

export const ingestRepo = async (owner, repo) => {
  const response = await fetch(`${BASE_URL}/repo/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ owner, repo }),
  });
  return parseJson(response);
};

export const askChat = async (question, namespace, onChunk) => {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, namespace }),
  });
  if (!response.ok) {
  const body = await response.json().catch(() => null)

  const message =
    body?.error ||
    body?.message ||
    response.statusText ||
    'Unknown error from backend'

  throw new Error(message)
}

if (!response.body) {
  throw new Error('Streaming is not supported by this response.')
}

const reader = response.body.getReader()
const decoder = new TextDecoder()

let answer = ''

while (true) {
  const { value, done } = await reader.read()

  if (done) break

  const chunk = decoder.decode(value, { stream: true })

  answer += chunk

  if (onChunk) {
    onChunk(chunk)
  }
}

return answer
};
