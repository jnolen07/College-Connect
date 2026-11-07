// Segmented control: Everything / TV shows / Movies.
export default function KindFilter({ kind, setKind }) {
  return (
    <div role="tablist" aria-label="Filter by type" className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[.03] p-1">
      {[
        ['all', 'Everything'],
        ['tv', 'TV shows'],
        ['movie', 'Movies'],
      ].map(([k, label]) => (
        <button
          key={k}
          role="tab"
          aria-selected={kind === k}
          onClick={() => setKind(k)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            kind === k ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
