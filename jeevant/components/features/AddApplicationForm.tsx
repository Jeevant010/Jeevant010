"use client";

import { createApplication } from "@/lib/actions/career.actions";
import { Building2 } from "lucide-react";

export default function AddApplicationForm() {

  return (
    <div className="bg-pink-900/10 border border-pink-900/50 p-4 mb-8">
      <form action={createApplication} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-pink-500" />
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Target Acquisition</h3>
          </div>
        </div>

        <div className="flex gap-4">
          <input name="company" placeholder="TARGET CORP *" required className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-2 outline-none flex-1 focus:border-white transition-all placeholder-pink-900 font-bold uppercase text-sm" />
          <input name="role" placeholder="ROLE *" required className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-2 outline-none flex-1 focus:border-white transition-all placeholder-pink-900 font-bold uppercase text-sm" />
          <select name="status" defaultValue="applied" className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-2 outline-none w-1/4 focus:border-white transition-all font-bold uppercase text-sm">
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="ghosted">Ghosted</option>
          </select>
        </div>

        <div className="space-y-4 pt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <input name="companyUrl" placeholder="Company URL" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
            <input name="location" placeholder="Location" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input name="salary" placeholder="Salary/Compensation" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm" />
            <div className="flex items-center bg-shell-bg border border-pink-900 px-2">
               <span className="text-xs text-pink-700 font-bold uppercase tracking-widest mr-2">Due:</span>
               <input type="date" name="deadline" className="bg-transparent text-shell-text py-2 outline-none focus:border-pink-500 text-sm w-full" />
            </div>
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
             <textarea name="notes" placeholder="Notes (Links, Context, etc.)" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-16 resize-none custom-scrollbar" />
             <textarea name="benefits" placeholder="Benefits (CSV)" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-16 resize-none custom-scrollbar" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <textarea name="feedback" placeholder="Interview Feedback" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-16 resize-none custom-scrollbar" />
             <textarea name="offerDetails" placeholder="Offer Details" className="bg-shell-bg border border-pink-900 text-shell-text px-4 py-2 outline-none focus:border-pink-500 text-sm h-16 resize-none custom-scrollbar" />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-pink-700 font-bold uppercase tracking-widest">Order</label>
              <input name="order" type="number" defaultValue="0" className="w-20 bg-shell-bg border border-pink-900 text-shell-text px-2 py-1 outline-none focus:border-pink-500 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-pink-700 font-bold uppercase tracking-widest">Interviews</label>
              <input name="interviews" type="number" defaultValue="0" className="w-20 bg-shell-bg border border-pink-900 text-shell-text px-2 py-1 outline-none focus:border-pink-500 text-sm" />
            </div>
          </div>
        </div>

        <button className="w-full bg-pink-600 text-black font-black px-6 py-3 hover:bg-white hover:text-pink-600 transition uppercase italic mt-4">
          Hack In (Save Target)
        </button>
      </form>
    </div>
  );
}
