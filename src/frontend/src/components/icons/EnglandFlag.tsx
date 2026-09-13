type Props = {
  className?: string;
};

/** The flag of England: St. George's Cross, a red cross on white. */
export function EnglandFlag({ className }: Props) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
      <rect width="30" height="20" fill="#ffffff" />
      <rect x="12" width="6" height="20" fill="#ce1124" />
      <rect y="7" width="30" height="6" fill="#ce1124" />
    </svg>
  );
}
