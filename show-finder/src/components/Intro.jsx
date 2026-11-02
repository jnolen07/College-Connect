// Black stage, gold "ShowFinder" under a spotlight, then a Next button.
export default function Intro({ onNext }) {
  return (
    <div className="intro" onKeyDown={(e) => e.key === 'Enter' && onNext()}>
      <div className="beam" />
      <div className="spot" />
      <div className="floor" />
      <h1 className="word gold-text font-display">ShowFinder</h1>
      <p className="tag">Your next favorite show is already on your services</p>
      <button className="next btn-gold" onClick={onNext} autoFocus>
        Next
      </button>
    </div>
  )
}
