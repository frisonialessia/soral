// components/top-bar.tsx
import Link from "next/link";

export function TopBar() {
  return (
    <div className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-[30px]">
        <Link href="/" className="flex items-center gap-3 font-semibold text-[16px] tracking-tight">
          <span
            className="h-[30px] w-[30px] rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg,#5B6EF5,#8476FF,#E59BB0,#EB4F6C,#5B6EF5)",
            }}
          />
          <span>
            Soral
            <span className="-mt-0.5 block text-[11.5px] font-normal text-ink-3">
              Planta Tijuana Norte
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-[13px] text-ink-2">
          <span className="rounded-full border border-line px-3 py-1 text-[12.5px]">
            Semana 24 · 2026
          </span>
          <span className="hidden sm:inline">Actualizado hace 2 h</span>
        </div>
      </div>
    </div>
  );
}
