const techStack = [
  ".NET",
  "React",
  "TypeScript",
  "MongoDB",
  "GraphQL",
  "Azure",
  "Tailwind CSS",
  "Docker",
];

export function TechStackCard() {
  return (
    <div className="bg-term-panel rounded-lg border border-term-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-term-border bg-term-bg/60">
        <span className="w-2.5 h-2.5 rounded-full bg-term-pink" />
        <span className="w-2.5 h-2.5 rounded-full bg-term-orange" />
        <span className="w-2.5 h-2.5 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted">./stack.json</span>
      </div>
      <div className="p-6 sm:p-8 text-sm sm:text-base">
        <div>
          <span className="text-term-muted">{"{"}</span>
        </div>
        <div className="pl-4">
          <span className="text-term-blue">"tech_stack"</span>
          <span className="text-term-muted">: [</span>
        </div>
        <div className="pl-8 flex flex-wrap gap-x-2 gap-y-2 py-2">
          {techStack.map((tech, i) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-md bg-term-bg border border-term-border text-term-orange transition-colors hover:border-term-green hover:text-term-green"
            >
              "{tech}"{i < techStack.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
        <div className="pl-4">
          <span className="text-term-muted">]</span>
        </div>
        <div>
          <span className="text-term-muted">{"}"}</span>
        </div>
      </div>
    </div>
  );
}
