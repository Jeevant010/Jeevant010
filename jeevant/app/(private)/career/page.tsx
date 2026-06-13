import { getApplications, createApplication } from "@/lib/actions/career.actions";
import { Building2 } from "lucide-react";
import ApplicationCard from "./ApplicationCard";

export const dynamic = "force-dynamic";

export default async function CareerKanban() {
  const applications = await getApplications();

  // Group by status
  const columns = {
    applied: applications.filter((a: any) => a.status === "applied"),
    interview: applications.filter((a: any) => a.status === "interview"),
    offer: applications.filter((a: any) => a.status === "offer"),
  };

  return (
    <div className="min-h-screen bg-[#050505] text-pink-500 p-8 font-mono relative overflow-hidden -m-8">
      
      {/* NEON GRID BG */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-12 border-b border-pink-900/50 pb-6">
          <div>
            <h1 className="text-5xl font-black text-shell-text uppercase italic tracking-tighter" style={{ textShadow: "4px 4px 0px #be185d" }}>
              Corp Infiltration
            </h1>
            <p className="text-pink-600 font-bold mt-2 tracking-[0.2em]">// TARGET_ACQUISITION_LOG</p>
          </div>
          
          {/* NEW TARGET FORM (Inline) */}
          <form action={createApplication} className="flex gap-0 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <div className="bg-pink-900/20 border border-pink-600 flex items-center px-4">
               <Building2 className="w-4 h-4 text-pink-500" />
            </div>
            <input name="company" placeholder="TARGET CORP" required className="bg-shell-bg border-y border-pink-600 text-pink-400 px-4 py-3 outline-none w-32 focus:w-48 transition-all placeholder-pink-900 font-bold uppercase" />
            <input name="role" placeholder="ROLE" required className="bg-shell-bg border border-pink-600 text-pink-400 px-4 py-3 outline-none w-32 focus:w-48 transition-all placeholder-pink-900 font-bold uppercase" />
            <button className="bg-pink-600 text-black font-black px-6 py-3 hover:bg-white hover:text-pink-600 transition uppercase italic">
              Hack In
            </button>
          </form>
        </div>

        {/* KANBAN BOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMN 1: APPLIED */}
          <div className="bg-[#0a0a0a] border-2 border-dashed border-pink-900/30 min-h-[500px] p-4 relative">
            <h3 className="text-2xl font-black text-shell-muted uppercase mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-500 rotate-45" /> Initiated
            </h3>
            <div className="space-y-4">
              {columns.applied.map((app: any) => (
                <ApplicationCard key={app._id} app={app} nextStatus="interview" color="border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]" />
              ))}
            </div>
          </div>

          {/* COLUMN 2: INTERVIEW */}
          <div className="bg-[#0a0a0a] border-2 border-dashed border-yellow-900/30 min-h-[500px] p-4 relative">
             <h3 className="text-2xl font-black text-yellow-500 uppercase mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rotate-45" /> Engagement
            </h3>
            <div className="space-y-4">
              {columns.interview.map((app: any) => (
                <ApplicationCard key={app._id} app={app} nextStatus="offer" color="border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
              ))}
            </div>
          </div>

          {/* COLUMN 3: OFFER */}
          <div className="bg-[#0a0a0a] border-2 border-dashed border-green-900/30 min-h-[500px] p-4 relative">
             <h3 className="text-2xl font-black text-green-500 uppercase mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rotate-45" /> Captured
            </h3>
            <div className="space-y-4">
              {columns.offer.map((app: any) => (
                <ApplicationCard key={app._id} app={app} nextStatus="archived" color="border-green-500 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
