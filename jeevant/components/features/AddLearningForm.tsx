"use client";

import { useState } from "react";
import { addLearning } from "@/lib/actions/learning.actions";
import { ChevronDown, ChevronUp } from "lucide-react";

export function AddLearningForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-green-900/10 border border-green-500/30 p-6 mb-12 relative">
      <div className="absolute top-4 right-4">
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-green-700 hover:text-green-500 uppercase tracking-widest flex items-center gap-1"
        >
          {showAdvanced ? <><ChevronUp className="w-4 h-4"/> Simple</> : <><ChevronDown className="w-4 h-4"/> Advanced</>}
        </button>
      </div>

      <form action={addLearning} className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end pr-24">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-green-700 uppercase">Skill / Course Name *</label>
            <input name="title" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Total Modules *</label>
             <input name="totalModules" type="number" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
          <div className="w-32">
             <label className="text-xs text-green-700 uppercase">Completed *</label>
             <input name="completedModules" type="number" defaultValue="0" required className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-green-900/30 mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-green-700 uppercase">Platform</label>
                <input name="platform" placeholder="e.g. Udemy" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Instructor</label>
                <input name="instructor" placeholder="John Doe" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Type</label>
                <select name="type" defaultValue="course" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none">
                  <option value="course">Course</option>
                  <option value="book">Book</option>
                  <option value="guide">Guide</option>
                  <option value="paper">Paper</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Status</label>
                <select name="status" defaultValue="in-progress" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none">
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-green-700 uppercase">Course URL</label>
                <input name="url" placeholder="https://..." className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Certificate URL</label>
                <input name="certificateUrl" placeholder="https://..." className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-green-700 uppercase">Difficulty</label>
                <select name="difficulty" defaultValue="beginner" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Price</label>
                <input name="price" placeholder="Free / $10" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">Start Date</label>
                <input type="date" name="startDate" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-green-700 uppercase">End Date</label>
                <input type="date" name="endDate" className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-green-700 uppercase">Skills Gained (CSV)</label>
                <input name="skillsGained" placeholder="React, Node..." className="w-full bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <label className="text-xs text-green-700 uppercase">Rating (1-10)</label>
                <input type="number" name="rating" min="1" max="10" className="w-20 bg-shell-bg border border-green-800 text-green-400 px-3 py-1 focus:border-green-400 outline-none" />
                
                <select name="visibility" defaultValue="private" className="bg-shell-bg border border-green-800 text-green-400 px-3 py-1.5 focus:border-green-400 outline-none text-xs">
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-green-700 uppercase">Review / Notes</label>
              <textarea name="review" className="w-full h-20 resize-none bg-shell-bg border border-green-800 text-green-400 px-3 py-2 focus:border-green-400 outline-none" placeholder="My thoughts on this..." />
            </div>

          </div>
        )}

        <button className="w-full mt-4 bg-green-600 text-black font-bold px-6 py-3 hover:bg-green-500 transition uppercase tracking-widest text-sm">
          Initiate Upload
        </button>
      </form>
    </div>
  );
}
