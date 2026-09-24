export default function RepoIngestForm({ owner, repo, onChange, onSubmit, loading, error }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-300" htmlFor="owner">
          GitHub owner
        </label>
        <input
          id="owner"
          name="owner"
          value={owner}
          onChange={onChange}
          disabled={loading}
          placeholder="vercel"
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-300" htmlFor="repo">
          Repository name or URL
        </label>
        <input
          id="repo"
          name="repo"
          value={repo}
          onChange={onChange}
          disabled={loading}
          placeholder="next.js or https://github.com/owner/repo"
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Indexing repository...' : 'Ingest repository'}
      </button>

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
