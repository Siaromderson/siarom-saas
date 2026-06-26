"use client";

import { useState } from "react";

export interface Point {
  label: string;
  value: number;
}

// Gráfico de linhas em SVG (sem dependências). Responsivo via viewBox.
export function LineChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const PAD = { t: 16, r: 16, b: 28, l: 32 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? iw / (data.length - 1) : 0;
  const x = (i: number) => PAD.l + i * stepX;
  const y = (v: number) => PAD.t + ih - (v / max) * ih;

  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${PAD.t + ih} L${x(0)},${PAD.t + ih} Z`;

  // linhas de grade horizontais (4)
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => PAD.t + ih - f * ih);

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block w-full max-h-[280px]"
        role="img"
        aria-label="Atendimentos por dia"
      >
        <defs>
          <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f8560" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2f8560" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lc-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1f6a4b" />
            <stop offset="100%" stopColor="#4ea27b" />
          </linearGradient>
        </defs>

        {grid.map((gy, i) => (
          <line key={i} x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy} stroke="#e2e8f0" strokeWidth={1} />
        ))}

        <path d={area} fill="url(#lc-fill)" />
        <path d={line} fill="none" stroke="url(#lc-stroke)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <g key={i}>
            {hover === i && (
              <line x1={p[0]} y1={PAD.t} x2={p[0]} y2={PAD.t + ih} stroke="#94a3b8" strokeDasharray="3 3" />
            )}
            <circle
              cx={p[0]}
              cy={p[1]}
              r={hover === i ? 5 : 3}
              fill="#ffffff"
              stroke="#1f6a4b"
              strokeWidth={2}
            />
            {/* área de hover */}
            <rect
              x={p[0] - stepX / 2}
              y={PAD.t}
              width={stepX || iw}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {hover === i && (
              <g>
                <rect x={p[0] - 26} y={p[1] - 30} width={52} height={20} rx={5} fill="#0c4630" />
                <text x={p[0]} y={p[1] - 16} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                  {data[i].value}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* rótulos do eixo X (a cada ~ n/7) */}
        {data.map((d, i) => {
          const every = Math.ceil(data.length / 7);
          if (i % every !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
