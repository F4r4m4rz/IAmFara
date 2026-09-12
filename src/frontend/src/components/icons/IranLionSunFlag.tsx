type Props = {
  className?: string;
};

/**
 * Stylized Lion-and-Sun flag of Iran (pre-1979): green/white/red tricolor
 * with a golden sun-and-lion emblem in the center stripe.
 */
export function IranLionSunFlag({ className }: Props) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
      <rect width="30" height="20" fill="#ffffff" />
      <rect width="30" height="6.6" fill="#23a24d" />
      <rect y="13.4" width="30" height="6.6" fill="#da2c2c" />
      <g transform="translate(15,10)">
        <g stroke="#c8a415" strokeWidth="0.7">
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="-3.6"
              x2="0"
              y2="-5.2"
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>
        <circle r="1.5" fill="#c8a415" />
        <path
          d="M-3.2 3.8 C-4 1.5 -3.2 -0.6 -1.5 -1.3 C-1.9 -2.4 -0.9 -3.1 0 -2.9 C0.9 -3.1 1.9 -2.4 1.5 -1.3 C3.2 -0.6 4 1.5 3.2 3.8 C1.9 3 0.9 3.4 0 3.1 C-0.9 3.4 -1.9 3 -3.2 3.8 Z"
          fill="#c8a415"
        />
      </g>
    </svg>
  );
}
