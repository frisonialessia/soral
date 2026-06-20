"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(43,45,66,.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[560px] animate-pop rounded-xl bg-surface p-7"
        style={{ boxShadow: "0 24px 64px rgba(43,45,66,.18)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      aria-label="Cerrar"
      onClick={onClose}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink-1"
    >
      ✕
    </button>
  );
}
