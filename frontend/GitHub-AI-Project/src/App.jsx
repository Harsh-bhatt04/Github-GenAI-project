import { useMemo, useState } from 'react'
import RepoIngestForm from './components/RepoIngestForm.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import { ingestRepo, askChat } from './api/index.js'

const sampleQuestions = [
  'What are the main features of this repository?',
  'Where is the entry point for the app?',
  'Explain the data flow and key services.',
  'What files contain frontend components?',
  'Are there any backend API endpoints?'
]

function App() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [namespace, setNamespace] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loadingIngest, setLoadingIngest] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [ingestError, setIngestError] = useState('')
  const [chatError, setChatError] = useState('')

  const hasNamespace = Boolean(namespace)
  const isChatDisabled = !hasNamespace

  const parseRepositoryInput = (ownerInput, repoInput) => {
    const normalizeUrl = (value) => {
      try {
        const url = new URL(value)
        if (!url.hostname.includes('github.com')) return null
        const path = url.pathname.replace(/^\/|\/$/g, '')
        const [ownerValue, repoValue] = path.split('/')
        return ownerValue && repoValue ? { owner: ownerValue, repo: repoValue } : null
      } catch {
        return null
      }
    }

    const trimmedOwner = ownerInput.trim()
    const trimmedRepo = repoInput.trim()

    if (trimmedRepo && /^https?:\/\//.test(trimmedRepo)) {
      return normalizeUrl(trimmedRepo)
    }

    if (!trimmedRepo && trimmedOwner && /^https?:\/\//.test(trimmedOwner)) {
      return normalizeUrl(trimmedOwner)
    }

    if (!trimmedRepo && trimmedOwner.includes('/')) {
      const parts = trimmedOwner.split('/').filter(Boolean)
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] }
      }
    }

    if (trimmedOwner && trimmedRepo) {
      return { owner: trimmedOwner, repo: trimmedRepo }
    }

    return null
  }

  const handleRepoChange = (event) => {
    const { name, value } = event.target
    if (name === 'owner') setOwner(value)
    if (name === 'repo') setRepo(value)
  }

  const handleIngest = async () => {
    setIngestError('')
    setChatError('')

    const parsed = parseRepositoryInput(owner, repo)
    if (!parsed) {
      setIngestError('Enter a valid GitHub owner/repo or repository URL.')
      return
    }

    setLoadingIngest(true)
    try {
      const result = await ingestRepo(parsed.owner, parsed.repo)
      setNamespace(result.namespace)
      setSessionInfo({
        repo: `${parsed.owner}/${parsed.repo}`,
        chunks: result.chunks,
        namespace: result.namespace,
      })
      setMessages([
        {
          role: 'system',
          text: `Indexed ${parsed.owner}/${parsed.repo} successfully with namespace ${result.namespace}. You can now ask questions about this repository.`,
        },
      ])
    } catch (error) {
      setIngestError(error.message)
    } finally {
      setLoadingIngest(false)
    }
  }

const handleSendQuestion = async (prompt) => {
  setChatError('')
  setLoadingChat(true)

  setMessages((current) => [
    ...current,
    { role: 'user', text: prompt },
    { role: 'assistant', text: '' },
  ])

  let wordQueue = []
  let displayedText = ''
  let processing = false

  const processWords = async () => {
    if (processing) return

    processing = true

    while (wordQueue.length > 0) {
      const word = wordQueue.shift()

      displayedText += word

      setMessages((current) => {
        const updated = [...current]
        const lastMessage = updated[updated.length - 1]

        updated[updated.length - 1] = {
          ...lastMessage,
          text: displayedText,
        }

        return updated
      })

      // Controls the word-by-word speed
      await new Promise((resolve) => setTimeout(resolve, 25))
    }

    processing = false
  }

  try {
    await askChat(prompt, namespace, (chunk) => {
      // Keep spaces attached to the word
      const words = chunk.match(/\S+\s*/g) || []

      wordQueue.push(...words)

      processWords()
    })

    // Wait until all queued words are displayed
    while (processing || wordQueue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    setQuestion('')
  } catch (error) {
    setChatError(error.message)

    setMessages((current) => {
      const updated = [...current]

      updated[updated.length - 1] = {
        role: 'assistant',
        text: 'Unable to answer right now. Please try again.',
      }

      return updated
    })
  } finally {
    setLoadingChat(false)
  }
}
  const chosenSamples = useMemo(
    () => sampleQuestions.filter((item) => !messages.some((m) => m.text === item)),
    [messages],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1360px] flex-col gap-10 px-6 py-8 lg:px-10">
        <header className="rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-400/90">
                GitHub AI assistant
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl">
                Index a repo, then ask intelligent questions with the AI context engine.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-400">
                Ingest your GitHub repository and use the repo-specific chat interface to query code, architecture, and docs. This app only uses the existing backend APIs and keeps backend requests isolated in one file.
              </p>
            </div>
            {/* <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6 text-sm text-slate-300 shadow-soft">
              <p className="font-semibold text-slate-100">Backend API endpoints</p>
              <ul className="mt-4 space-y-3">
                <li className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Repo ingest</p>
                  <p className="mt-1 font-medium text-slate-100">POST /repo/ingest</p>
                </li>
                <li className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Chat query</p>
                  <p className="mt-1 font-medium text-slate-100">POST /api/chat</p>
                </li>
              </ul>
            </div> */}
          </div>
        </header>

        <main className="grid gap-8 xl:grid-cols-[440px_1fr]">
          <section className="space-y-8 rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-8 shadow-soft">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-400/90">Repository ingestion</p>
              <h2 className="text-3xl font-semibold text-white">Start your repo session</h2>
              <p className="text-slate-400">
                Provide the GitHub owner and repository name, then index the repository so chat queries can use the ingested repo context.
              </p>
            </div>

            <RepoIngestForm
              owner={owner}
              repo={repo}
              onChange={handleRepoChange}
              onSubmit={handleIngest}
              loading={loadingIngest}
              error={ingestError}
            />

            {/* <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Session details</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Repository</p>
                  <p className="mt-1 text-sm text-slate-100">{sessionInfo?.repo || 'Not ingested yet'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Indexed chunks</p>
                    <p className="mt-1 text-sm text-slate-100">{sessionInfo?.chunks ?? '-'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Namespace</p>
                    <p className="mt-1 text-sm text-slate-100 break-words">{sessionInfo?.namespace || '-'}</p>
                  </div>
                </div>
              </div> */}
            {/* </div> */}
          </section>

          <section className="flex min-h-[640px] flex-col rounded-[32px] border border-slate-800/90 bg-slate-950/90 p-8 shadow-soft">
            <ChatPanel
              messages={messages}
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleSendQuestion}
              loading={loadingChat}
              disabled={isChatDisabled}
              error={chatError}
              samples={chosenSamples}
              onChooseSample={(sample) => setQuestion(sample)}
            />
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
