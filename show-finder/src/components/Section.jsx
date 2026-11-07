import { ChevronDown } from 'lucide-react'

// Section title with a count, used above every grid.
export function SectionTitle({ title, count, hint, as: Tag = 'h2' }) {
  return (
    <div className="mt-10 flex items-baseline gap-3">
      <Tag className="text-xl font-semibold tracking-tight">{title}</Tag>
      {count !== undefined && <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-xs font-medium text-zinc-400">{count}</span>}
      {hint && <span className="hidden text-sm text-zinc-500 sm:inline">{hint}</span>}
    </div>
  )
}

// Collapsible section (e.g. "Not on your services").
export function Collapsible({ title, count, hint, open, onToggle, children }) {
  return (
    <div className="mt-12 border-t border-white/[.06] pt-8">
      <button onClick={onToggle} aria-expanded={open} className="group flex w-full items-center gap-3 text-left">
        <span className="text-xl font-semibold tracking-tight group-hover:text-amber-100">{title}</span>
        <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-xs font-medium text-zinc-400">{count}</span>
        {hint && <span className="hidden text-sm text-zinc-500 sm:inline">{hint}</span>}
        <ChevronDown size={20} className={`ml-auto text-zinc-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  )
}

// Friendly empty state with an icon and an optional action.
export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="card mx-auto mt-8 flex max-w-lg flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-200">
          <Icon size={22} />
        </span>
      )}
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      {body && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorNote({ children }) {
  return <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{children}</p>
}
