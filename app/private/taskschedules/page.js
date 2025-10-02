import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const mockTasks = [
  { task: "Review PRs on GGStats", scheduled: "09:30 AM", repo: "Jeevant010/GGStats", completed: false },
  { task: "Update README for Water_Management", scheduled: "11:00 AM", repo: "Jeevant010/Water_Management", completed: true },
  { task: "Plan new features for fun repo", scheduled: "02:00 PM", repo: "Jeevant010/fun", completed: false },
  { task: "Sync with M_Mart contributors", scheduled: "03:30 PM", repo: "RakeshParkash/M_Mart", completed: false },
  { task: "Publish new blog post", scheduled: "05:00 PM", repo: "Jeevant010/Jeevant010", completed: false },
  { task: "Test water sensors", scheduled: "06:30 PM", repo: "Jeevant010/Water_Management", completed: false }
];

export default function TaskSchedules() {
  const [tasks] = useState(mockTasks);

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8 text-pink-700 flex items-center gap-2">
        <ClockIcon className="h-8 w-8 text-pink-400" />
        Tasks & Schedules
      </h2>
      <p className="mb-8 text-gray-700 text-lg">Plan, organize, and track your daily tasks and schedules. All data is private and editable via UI.</p>
      <div className="grid md:grid-cols-2 gap-7">
        {tasks.map((t, idx) => (
          <div key={idx}
            className={`rounded-xl border shadow-lg p-6 flex flex-col gap-3 
              ${t.completed ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'} 
              hover:scale-[1.02] transition`}
          >
            <div className="flex items-center gap-3">
              {t.completed ? 
                <CheckCircleIcon className="h-6 w-6 text-green-600" /> : 
                <ClockIcon className="h-6 w-6 text-yellow-500" />}
              <span className="text-xl font-semibold">{t.task}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm px-2 py-1 bg-gray-200 rounded">{t.scheduled}</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">{t.repo}</span>
            </div>
            <div>
              <span className={`font-bold px-3 py-1 rounded ${t.completed ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}> 
                {t.completed ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-gray-400">[Editing UI coming soon]</div>
    </main>
  );
}