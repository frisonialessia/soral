// components/dashboard/gauge.tsx
// Gauge circular (anillo de progreso) para KPIs tipo "salud de planta".
const R = 52;
const CIRC = 2 * Math.PI * R;

export function Gauge({ value, label, color = "#5B6EF5" }: { value: number; label: string; color?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const dash = (v / 100) * CIRC;
  return (
    <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`${label}: ${v}%`}>
      <circle cx="70" cy="70" r={R} fill="none" stroke="#E8EAF2" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${dash.toFixed(1)} ${CIRC.toFixed(1)}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="68" textAnchor="middle" fontSize="30" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" fill="#2B2D42">
        {v}%
      </text>
      <text x="70" y="90" textAnchor="middle" fontSize="11" fill="#A9AEC2">
        {label}
      </text>
    </svg>
  );
}
