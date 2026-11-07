import Logo from './Logo.jsx'

// Slim top bar for setup screens, with step progress.
export default function OnboardingBar({ step, total = 2, label }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[.06] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo onClick={() => (window.location.hash = '#/welcome')} />
        {step && (
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 sm:inline">{label}</span>
            <span className="text-xs font-medium text-zinc-400">
              Step {step} of {total}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={`h-1.5 w-8 rounded-full ${i < step ? 'bg-amber-300' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
