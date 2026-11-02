export default function KindFilter({ kind, setKind }) {
  return (
    <div className="mt-5 flex gap-2">
      {[
        ['all', 'Everything'],
        ['tv', 'TV shows'],
        ['movie', 'Movies'],
      ].map(([k, label]) => (
        <button
          key={k}
          onClick={() => setKind(k)}
          className={`rounded-full px-3 py-1 text-sm transition ${kind === k ? 'bg-amber-200 text-black' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
