const achievements = [
  "Built scalable dashboard for GGStats.",
  "Created Water Management app used by 1,000+ users.",
  "Top contributor to open source projects.",
];

export default function Achievements() {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">Achievements</h2>
      <ul className="list-disc pl-5 text-gray-700">
        {achievements.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </section>
  );
}
