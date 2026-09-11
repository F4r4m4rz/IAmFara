function Projects() {
  return (
    <div className="rounded-lg border border-term-border bg-term-panel shadow-2xl overflow-hidden font-mono">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-term-border bg-term-bg/60">
        <span className="w-3 h-3 rounded-full bg-term-pink" />
        <span className="w-3 h-3 rounded-full bg-term-orange" />
        <span className="w-3 h-3 rounded-full bg-term-green" />
        <span className="ml-2 text-xs text-term-muted">
          faramarz@iamfara: ~/projects
        </span>
      </div>
      <div className="p-8 text-center text-term-muted">
        <span className="text-term-green">$</span> ls ./projects
        <p className="mt-4 text-term-text">Mine prosjekter kommer her!</p>
      </div>
    </div>
  );
}

export default Projects;
