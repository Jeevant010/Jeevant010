"use client";

import { addSnippet } from "@/lib/actions/snippet.actions";
import { Plus } from "lucide-react";

export default function AddSnippetForm() {

  return (
    <div className="relative z-10 mb-12 bg-[#2a2520] border-2 border-[#50453b] p-6 shadow-2xl max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#e0d0c0] font-bold uppercase flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" /> Craft New Item
        </h3>
      </div>

      <form action={addSnippet} className="space-y-4">
        <div className="flex gap-4">
           <input name="title" placeholder="ITEM NAME (e.g. Auth Hook) *" required className="flex-1 bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
           <input name="language" placeholder="TYPE (e.g. TSX) *" required className="w-32 bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
        </div>
        
        <textarea name="code" placeholder="SOURCE CODE DATA... *" required className="w-full h-32 bg-[#1a1816] border border-[#50453b] p-3 text-shell-text font-mono text-sm outline-none focus:border-green-600 resize-none custom-scrollbar" />
        
        <div className="flex gap-4">
          <input name="tags" placeholder="TAGS (comma separated)" className="flex-1 bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
          <input name="folder" placeholder="FOLDER (e.g. General)" defaultValue="General" className="w-1/3 bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
        </div>

        <div className="space-y-4 pt-4 border-t border-[#50453b]/50 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="description" placeholder="Description" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
            <input name="useCase" placeholder="Use Case" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select name="complexity" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600">
              <option value="low">Complexity: Low</option>
              <option value="medium">Complexity: Medium</option>
              <option value="high">Complexity: High</option>
            </select>
            <input name="author" placeholder="Author" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
            <input name="lastTestedVersion" placeholder="Last Tested Version" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="dependencies" placeholder="Dependencies (CSV)" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
            <input name="relatedSnippets" placeholder="Related Snippets (CSV)" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="performanceNotes" placeholder="Performance Notes" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
            <input name="securityNotes" placeholder="Security Notes" className="bg-[#1a1816] border border-[#50453b] p-3 text-shell-text outline-none focus:border-green-600" />
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 text-[#8a7560] text-sm">
              <input type="checkbox" name="isDeprecated" className="w-4 h-4 bg-[#1a1816] border-[#50453b]" />
              Mark as Deprecated
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8a7560] uppercase tracking-widest">Order</label>
              <input name="order" type="number" defaultValue="0" className="w-20 bg-[#1a1816] border border-[#50453b] p-2 text-shell-text outline-none focus:border-green-600 text-sm" />
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-[#3a3530] border border-[#50453b] text-[#e0d0c0] font-bold uppercase hover:bg-green-800 hover:text-shell-text transition mt-4">
          Store in Inventory
        </button>
      </form>
    </div>
  );
}
