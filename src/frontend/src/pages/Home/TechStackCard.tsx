export function TechStackCard() {
  const techStack = [
    {
      name: ".NET",
      icon: "https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg",
    },
    {
      name: "React",
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    },
    {
      name: "MongoDB",
      icon: "https://webassets.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png",
    },
    {
      name: "GraphQL",
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-4 self-stretch">
        {techStack.map((tech) => (
          <div
            key={tech.name}
            className="flex flex-col items-center justify-center"
          >
            <img src={tech.icon} alt={tech.name} className="w-24 mb-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
