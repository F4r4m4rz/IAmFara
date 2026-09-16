/**
 * Renders a "photograph" as an illustrated SVG scene rather than a bitmap
 * image — this game ships with no photographic or AI-generated image
 * assets, so every in-fiction photo is a small hand-built scene (building
 * silhouette + figure silhouettes), aged with a sepia/grain treatment so it
 * still reads as an old, slightly degraded photograph rather than a clean
 * vector illustration. Reused across every archive photo in case-001 with
 * different figure layouts, which conveniently also sets up the
 * archived-photo-comparison puzzle later (same scene, different figures).
 */
export interface PhotoFigure {
  id: string;
  /** Position within the scene, 0-100 (percent of width/height). */
  x: number;
  y: number;
  /** Taller figures read as closer to camera; 1 = baseline height. */
  scale?: number;
}

interface StylizedPhotoProps {
  figures: readonly PhotoFigure[];
  /** Figure id the player can click to inspect/flag as significant. */
  interactiveFigureId?: string;
  onFigureClick?: (figureId: string) => void;
  caption?: string;
  className?: string;
}

function FigureSilhouette({
  figure,
  interactive,
  onClick,
}: {
  figure: PhotoFigure;
  interactive: boolean;
  onClick?: () => void;
}) {
  const scale = figure.scale ?? 1;
  const headRadius = 3.2 * scale;
  const bodyHeight = 14 * scale;
  const bodyWidth = 7 * scale;

  return (
    <g
      transform={`translate(${figure.x}, ${figure.y})`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? "Inspect this figure" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onClick?.();
            }
          : undefined
      }
      style={interactive ? { cursor: "pointer" } : undefined}
      className={interactive ? "outline-none focus-visible:opacity-70" : undefined}
    >
      {/* A larger, invisible hit target — the silhouette itself is thin. */}
      {interactive && (
        <rect x={-10} y={-headRadius * 2 - 2} width={20} height={bodyHeight + headRadius * 2 + 4} fill="transparent" />
      )}
      <circle cy={-bodyHeight - headRadius} r={headRadius} fill="#2b2620" />
      <path
        d={`M ${-bodyWidth / 2} 0 L ${-bodyWidth / 2 - 1} ${-bodyHeight} L ${bodyWidth / 2 + 1} ${-bodyHeight} L ${bodyWidth / 2} 0 Z`}
        fill="#2b2620"
      />
    </g>
  );
}

export default function StylizedPhoto({
  figures,
  interactiveFigureId,
  onFigureClick,
  caption,
  className = "",
}: StylizedPhotoProps) {
  return (
    <figure className={`inline-block ${className}`}>
      <div
        className="relative overflow-hidden border-[6px] border-[#e8e2d0] shadow-lg"
        style={{ filter: "sepia(0.55) contrast(1.05) brightness(0.92)" }}
      >
        <svg viewBox="0 0 100 60" className="block h-auto w-full" role="img" aria-label={caption ?? "An old photograph"}>
          <defs>
            <linearGradient id="photo-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5c4" />
              <stop offset="100%" stopColor="#e4ded0" />
            </linearGradient>
            <filter id="photo-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
            </filter>
          </defs>

          <rect x={0} y={0} width={100} height={60} fill="url(#photo-sky)" />
          {/* Ground */}
          <rect x={0} y={42} width={100} height={18} fill="#8a8368" />
          {/* Building */}
          <rect x={30} y={12} width={40} height={32} fill="#a89f86" stroke="#6f6852" strokeWidth={0.5} />
          <rect x={30} y={12} width={40} height={4} fill="#6f6852" />
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={33 + col * 6}
                y={18 + row * 6}
                width={3.2}
                height={3.6}
                fill="#4a4638"
                opacity={0.75}
              />
            )),
          )}

          {figures.map((figure) => (
            <FigureSilhouette
              key={figure.id}
              figure={figure}
              interactive={figure.id === interactiveFigureId}
              onClick={() => onFigureClick?.(figure.id)}
            />
          ))}

          <rect x={0} y={0} width={100} height={60} filter="url(#photo-grain)" />
        </svg>
      </div>
      {caption && <figcaption className="mt-1 text-xs italic text-[#5c5540]">{caption}</figcaption>}
    </figure>
  );
}
