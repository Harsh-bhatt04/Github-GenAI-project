import { useEffect, useRef } from 'react'

export default function ChatPanel({
  messages,
  question,
  onQuestionChange,
  onSubmit,
  loading,
  disabled,
  error,
  samples,
  onChooseSample,
}) 
{

  const messagesEndRef = useRef(null)

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: 'auto',
  })

}, [messages])


  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-400/90">
              AI chat
            </p>
            <h2 className="text-2xl font-semibold text-white">Ask questions about your repo</h2>
          </div>
          <span className="rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-xs text-slate-400">
            {disabled ? 'Awaiting ingest' : 'Ready to ask'}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-400">
          Use the namespace created on ingestion to ask context-aware questions. The chat is active when the repository indexing completes.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-soft">
        <p className="text-sm font-semibold text-slate-300">Try one of these prompts</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {samples.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => onChooseSample(sample)}
              className="rounded-full border border-slate-700/90 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-500/60 hover:bg-slate-900"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950/80 p-4 shadow-soft">
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-slate-500">
              <div>
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="mt-2 text-sm text-slate-400">Ask a question after you index a repository.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-3xl p-4 ${
                  message.role === 'user'
                    ? 'bg-slate-900/80 text-slate-100 ring-1 ring-slate-700/70'
                    : 'bg-slate-800/90 text-slate-200 ring-1 ring-slate-700/50'
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>{message.role === 'user' ? 'You' : 'Assistant'}</span>
                </div>
                <p className="whitespace-pre-line text-sm leading-7">{message.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled && question.trim()) onSubmit(question.trim());
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="question" className="text-sm font-semibold text-slate-300">
            Ask a question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            disabled={disabled}
            rows={3}
            placeholder={disabled ? 'Ingest a repository first.' : 'What do you want to know about this repository?'}
            className="mt-2 w-full resize-none rounded-3xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || loading}
          className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Generating answer...' : 'Send question'}
        </button>
      </form>
    </div>
  );
}
