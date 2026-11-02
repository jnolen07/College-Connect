import ResetButton from './ResetButton.jsx'

// Black stage, gold "ShowFinder" under a spotlight, then a Next button.
// If someone already set the site up on this device, offer a fresh start for a new person.
export default function Intro({ onNext, savedCount }) {
  return (
    <div className="intro">
      <div className="beam" />
      <div className="spot" />
      <div className="floor" />
      <h1 className="word gold-text font-display">ShowFinder</h1>
      <p className="tag">Your next favorite show is already on your services</p>
      <button className="next btn-gold" onClick={onNext} autoFocus>
        Next
      </button>
      {savedCount !== null && (
        <div className="fresh-wrap">
          <ResetButton variant="intro" count={savedCount} />
        </div>
      )}
    </div>
  )
}
