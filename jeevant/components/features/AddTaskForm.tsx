"use client";

import { useState } from "react";
import { createTask } from "@/lib/actions/task.actions";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

export function AddTaskForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-[#0a0a0a] border border-slate-800 p-4 relative mb-8">
      <form action={createTask} className="relative flex flex-col gap-4">
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <ChevronRight className="w-5 h-5 text-red-500" />
          </div>
          <input 
            name="title"
            required
            autoComplete="off"
            placeholder="ENTER NEW OBJECTIVE... *" 
            className="w-full bg-black border-b-2 border-slate-800 text-shell-text pl-12 pr-16 py-4 text-lg focus:border-red-600 focus:outline-none placeholder-slate-700 font-bold transition-colors"
          />
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showAdvanced ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Priority</label>
                  <select name="priority" defaultValue="medium" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                  <select name="category" defaultValue="work" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                    <option value="work">Work</option>
                    <option value="learning">Learning</option>
                    <option value="read-later">Read Later</option>
                    <option value="deadline">Deadline</option>
                    <option value="competition">Competition</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Estimated Time (mins)</label>
                  <input name="estimatedTime" type="number" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Energy Level</label>
                  <select name="energyLevel" defaultValue="medium" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tags (CSV)</label>
                 <input name="tags" placeholder="react, design" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
              </div>
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Dependencies (CSV)</label>
                 <input name="dependencies" placeholder="task1, task2" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Due Date (Deadline)</label>
                  <input type="datetime-local" name="dueDate" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500 text-sm" />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reminder Alert</label>
                  <input type="datetime-local" name="reminderDate" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500 text-sm" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Source URL</label>
                  <input name="sourceUrl" placeholder="https://..." className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Assigned To</label>
                  <input name="assignedTo" placeholder="Self" className="w-full bg-black border border-slate-700 text-shell-text px-3 py-2 outline-none focus:border-red-500" />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Status Update</label>
                 <textarea name="statusUpdate" rows={2} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-1 outline-none focus:border-red-500 text-sm custom-scrollbar resize-none" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Blockers</label>
                 <textarea name="blockers" rows={2} className="w-full bg-black border border-slate-700 text-shell-text px-3 py-1 outline-none focus:border-red-500 text-sm custom-scrollbar resize-none" />
               </div>
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-red-900/20 border border-red-900 text-red-500 hover:bg-red-600 hover:text-white transition py-3 font-bold uppercase tracking-widest">
          Execute (Add Objective)
        </button>

      </form>
    </div>
  );
}
