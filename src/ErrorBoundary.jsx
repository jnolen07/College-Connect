import React from "react";
import { T, display } from "./theme";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: T.bg }}>
          <h1 style={{ ...display, color: T.text }} className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p style={{ color: T.muted }} className="text-sm mb-6 max-w-sm">
            Try reloading the page. If it keeps happening, let us know what you were doing.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: T.warm, color: "#0A0C11" }}
            className="text-sm font-semibold px-4 py-2 rounded-md"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
