import { useState } from "react";

export default function Schedules() {
  const [schedules, setSchedules] = useState([
    { date: "2025-09-15", event: "Deploy new feature to GGStats" },
    { date: "2025-09-20", event: "Water Management app review" },
  ]);
  const [newEvent, setNewEvent] = useState("");
  const [newDate, setNewDate] = useState("");

  function handleAdd() {
    if (newEvent && newDate) {
      setSchedules([...schedules, { date: newDate, event: newEvent }]);
      setNewEvent("");
      setNewDate("");
    }
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">My Schedules</h2>
      <ul className="mb-4">
        {schedules.map((s, i) => (
          <li key={i} className="mb-2">
            <span className="font-semibold">{s.date}: </span>
            <span>{s.event}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          value={newEvent}
          onChange={e => setNewEvent(e.target.value)}
          placeholder="Event"
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
    </section>
  );
}
