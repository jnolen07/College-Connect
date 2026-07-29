import { X } from "lucide-react";
import { T, display } from "../theme";

export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(5,6,9,0.7)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ ...display, color: T.text }} className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} style={{ color: T.muted }} className="p-1 hover:text-[#F2F1EC] transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
