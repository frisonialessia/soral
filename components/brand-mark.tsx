// components/brand-mark.tsx
// Marca de Soral: el "risk cluster" (mini mapa de riesgo — esquina cálida que
// se enfría). Fuente única para todos los lockups del logo (sidebar, landing,
// footer, preview), alineada con el favicon (app/icon.svg). Sin hooks → sirve
// tanto en componentes server como client. Decorativa: siempre va junto al
// wordmark "Soral", por eso es aria-hidden.
const DOTS: Array<{ cx: number; cy: number; fill: string }> = [
  { cx: 16, cy: 16, fill: "#EB4F6C" },
  { cx: 32, cy: 16, fill: "#F56C89" },
  { cx: 48, cy: 16, fill: "#B49AED" },
  { cx: 16, cy: 32, fill: "#B49AED" },
  { cx: 32, cy: 32, fill: "#8476FF" },
  { cx: 48, cy: 32, fill: "#5B6EF5" },
  { cx: 16, cy: 48, fill: "#8476FF" },
  { cx: 32, cy: 48, fill: "#5B6EF5" },
  { cx: 48, cy: 48, fill: "#5B6EF5" },
];

export function BrandMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={6.5} fill={d.fill} />
      ))}
    </svg>
  );
}
