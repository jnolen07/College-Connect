import { useState } from 'react'

// Brand tile: real logo on the brand's own background color.
export default function ServiceLogo({ service, size = 'lg', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const small = size === 'sm'
  const box = small ? 'h-6 w-6 rounded-md p-1' : 'h-full w-full rounded-2xl p-[18%]'

  let mark
  if (service.path) {
    mark = (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill={service.fg} role="img" aria-label={service.name}>
        <path d={service.path} />
      </svg>
    )
  } else if (!imgFailed) {
    // Disney+ / Peacock: official site icon, loaded live.
    mark = (
      <img
        src={`https://www.google.com/s2/favicons?domain=${service.domain}&sz=256`}
        alt={service.name}
        onError={() => setImgFailed(true)}
        className={`h-full w-full object-contain ${small ? '' : 'rounded-xl'}`}
      />
    )
  } else {
    mark = <Wordmark service={service} small={small} />
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden ${box} ${className}`}
      style={{ background: service.bg }}
      title={service.name}
    >
      {mark}
    </div>
  )
}

// Last-resort text versions styled after each brand.
function Wordmark({ service, small }) {
  if (small) return <span className="text-[9px] font-bold text-white">{service.name[0]}</span>
  if (service.id === 'peacock') {
    return (
      <div className="flex flex-col items-center">
        <span className="text-lg font-extrabold lowercase tracking-tight text-white">peacock</span>
        <span className="mt-1 flex gap-1">
          {['#ffc400', '#ff7a00', '#ff1f48', '#c537d2', '#3f6fff', '#00c3a5'].map((c) => (
            <i key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
      </div>
    )
  }
  return <span className="font-display text-xl font-semibold text-white">{service.name}</span>
}

export function ServiceBadges({ services }) {
  if (!services?.length) return null
  return (
    <div className="flex gap-1">
      {services.map((s) => (
        <ServiceLogo key={s.id} service={s} size="sm" />
      ))}
    </div>
  )
}
