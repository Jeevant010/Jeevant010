const skills = [
  "React.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "MongoDB Atlas",
  "Python",
  "Tailwind CSS",
];

export default function Skills() {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">Skills</h2>
      <ul className="flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <li key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm">{skill}</li>
        ))}
      </ul>
    </section>
  );
}
