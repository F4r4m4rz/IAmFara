import { BrainCircuit, Code2, Cpu, Globe } from "lucide-react";

export function AvatarBadge() {
  return (
    <div
      role="img"
      aria-label="Faramarz — web, AI, and software engineering"
      className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-lg border-2 border-term-border bg-term-panel overflow-hidden"
    >
      {/* glow blobs */}
      <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-term-purple/25 blur-2xl" />
      <div className="absolute -bottom-10 -right-6 w-28 h-28 rounded-full bg-term-blue/20 blur-2xl" />
      <div className="absolute top-1/3 -right-4 w-16 h-16 rounded-full bg-term-green/20 blur-xl" />

      {/* circuit traces */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full text-term-border"
        fill="none"
      >
        <path
          d="M100 100 L36 36 M100 100 L164 36 M100 100 L100 172 M36 36 L36 18 M164 36 L164 18 M100 172 L100 190"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="36" cy="18" r="3" className="fill-term-blue" />
        <circle cx="164" cy="18" r="3" className="fill-term-green" />
        <circle cx="100" cy="190" r="3" className="fill-term-orange" />
      </svg>

      {/* corner nodes */}
      <div className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-full bg-term-bg border border-term-border text-term-blue">
        <Globe className="w-4 h-4" />
      </div>
      <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-term-bg border border-term-border text-term-green">
        <Code2 className="w-4 h-4" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-term-bg border border-term-border text-term-orange">
        <Cpu className="w-4 h-4" />
      </div>

      {/* central AI node */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-term-bg border-2 border-term-purple/70 text-term-purple">
          <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
      </div>
    </div>
  );
}
