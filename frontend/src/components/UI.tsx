import React from "react";

export function Button({ children, className = "", primary = false, ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-xl font-semibold transition ${
        primary 
          ? "bg-[color:var(--color-airbnb-primary)] text-white hover:bg-[color:var(--color-airbnb-primary-hover)]" 
          : "bg-white border border-[color:var(--color-airbnb-border)] hover:bg-neutral-50 text-[color:var(--color-airbnb-text)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 rounded-xl ${className}`} />;
}

// Simple Toast/Modal placeholders for now
export function Modal({ isOpen, onClose, children, title }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-[color:var(--color-airbnb-border)]">
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition">
            ✕
          </button>
          <h2 className="font-bold">{title}</h2>
          <div className="w-8"></div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
