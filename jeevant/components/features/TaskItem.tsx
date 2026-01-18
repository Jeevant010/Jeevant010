"use client";

import { toggleTask, deleteTask } from "@/lib/actions/task.actions";
import { Trash2, Check, Clock } from "lucide-react";
import { useState } from "react";

export default function TaskItem({ task }: { task: any }) {
  const [completed, setCompleted] = useState(task.isCompleted);

  const handleToggle = async () => {
    // Optimistic update (feels instant)
    setCompleted(!completed);
    await toggleTask(task._id, task.isCompleted);
  };

  const handleDelete = async () => {
    if(!confirm("Delete this task?")) return;
    await deleteTask(task._id);
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition group ${completed ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-blue-500'}`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleToggle}
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-blue-400'}`}
        >
          {completed && <Check className="w-3 h-3 text-white" />}
        </button>
        <span className={`text-sm ${completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button title="trash" onClick={handleDelete} className="text-slate-500 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}