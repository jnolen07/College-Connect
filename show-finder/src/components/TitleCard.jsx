import { IMG } from '../tmdb.js'

export function ProviderLogos({ providers, max = 4 }) {
  if (!providers?.length) return null
  return (
    <div className="flex items-center gap-1">
      {providers.slice(0, max).map((p) => (
        <img key={p.id} src={`${IMG}/w45${p.logo}`} alt={p.name} title={p.name} className="h-6 w-6 rounded" />
      ))}
      {providers.length > max && <span className="text-xs text-zinc-400">+{providers.length - max}</span>}
    </div>
  )
}

export default function TitleCard({ title, onSelect, providers, onSeen, dim }) {
  return (
    <div className={`group relative flex flex-col ${dim ? 'opacity-70 hover:opacity-100' : ''}`}>
      <button onClick={() => onSelect(title)} className="text-left" title={`More like ${title.title}`}>
        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
          {title.poster ? (
            <img
              src={`${IMG}/w342${title.poster}`}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-3 text-center text-sm text-zinc-500">
              {title.title}
            </div>
          )}
        </div>
        <div className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{title.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 uppercase">{title.type === 'tv' ? 'TV' : 'Movie'}</span>
          {title.year && <span>{title.year}</span>}
          {title.rating > 0 && <span>★ {title.rating.toFixed(1)}</span>}
        </div>
      </button>
      {providers && (
        <div className="mt-1.5">
          <ProviderLogos providers={providers} />
        </div>
      )}
      {onSeen && (
        <button
          onClick={() => onSeen(title)}
          className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          title="Already seen it — hide from recommendations"
        >
          Seen it
        </button>
      )}
    </div>
  )
}
