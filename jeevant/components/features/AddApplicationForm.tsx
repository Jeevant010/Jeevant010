"use client";

import { useState } from "react";
import { createApplication } from "@/lib/actions/career.actions";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";

export default function AddApplicationForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-pink-900/10 border border-pink-900/50 p-4 mb-8">
      <form action={createApplication} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-pink-500" />
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Target Acquisition</h3>
          </div>
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-pink-600 hover:text-pink-400 uppercase tracking-widest flex items-center gap-1 font-bold"
          >
            {showAdvanced ? <><ChevronUp className="w-4 h-4"/> Simple</> : <><ChevronDown className="w-4 h-4"/> Advanced</>}
          </button>
        </div>

        <div className="flex gap-4">
          <input name="company" placeholder="TARGET CORP *" required className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-2 outline-none flex-1 focus:border-white transition-all placeholder-pink-900 font-bold uppercase" />
          <input name="role" placeholder="ROLE *" required className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-2 outline-none flex-1 focus:border-white transition-all placeholder-pink-900 font-bold uppercase" />
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-pink-900/50 mt-4 animate-in fade-in slide-in-from-top-2">
            
            <div className="grid grid-cols-2 gap-4">
              <input name="companyUrl" placeholder="Company URL" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
              <input name="location" placeholder="Location" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input name="salary" placeholder="Salary/Compensation" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
              <input type="date" name="deadline" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
              <select name="workModel" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input name="recruiterName" placeholder="Recruiter Name" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
              <input name="recruiterEmail" placeholder="Recruiter Email" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
              <input name="referral" placeholder="Referral By" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <textarea name="notes" placeholder="Notes (Links, Context, etc.)" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-20 resize-none" />
               <textarea name="benefits" placeholder="Benefits (CSV)" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-20 resize-none" />
            </div>

          </div>
        )}

        <button className="w-full bg-pink-600 text-black font-black px-6 py-3 hover:bg-white hover:text-pink-600 transition uppercase italic">
          Hack In (Save Target)
        </button>
      </form>
    </div>
  );
}
