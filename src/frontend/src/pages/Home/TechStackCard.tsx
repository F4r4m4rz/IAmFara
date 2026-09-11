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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="text-sm font-semibold tracking-wide text-gray-400 uppercase text-center mb-6">
        Tools &amp; technologies I work with
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
