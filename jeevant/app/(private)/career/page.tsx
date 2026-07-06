import { getApplications, createApplication } from "@/lib/actions/career.actions";
import { Building2 } from "lucide-react";
import { CareerBoard } from "@/components/features/CareerBoard";
import AddApplicationForm from "@/components/features/AddApplicationForm";

export const dynamic = "force-dynamic";

export default async function CareerKanban() {
  const applications = await getApplications();

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
        </div>
        <AddApplicationForm />

        {/* STATS BAR */}
        <div className="flex gap-8 mb-12 border-b border-pink-900/30 pb-6">
          <div className="bg-pink-900/10 border border-pink-900/50 p-4 min-w-[150px]">
             <div className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-1">Total Targets</div>
             <div className="text-3xl font-black text-pink-500">{applications.length}</div>
          </div>
          <div className="bg-pink-900/10 border border-pink-900/50 p-4 min-w-[150px]">
             <div className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-1">Interviews Active</div>
             <div className="text-3xl font-black text-white">{applications.filter((a: any) => a.status === 'interview').length}</div>
          </div>
          <div className="bg-pink-900/10 border border-pink-900/50 p-4 min-w-[150px]">
             <div className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-1">Offers Secured</div>
             <div className="text-3xl font-black text-green-500">{applications.filter((a: any) => a.status === 'offer').length}</div>
          </div>
        </div>

        {/* DRAG AND DROP KANBAN BOARD */}
        <CareerBoard initialApplications={applications} />

      </div>
    </div>
  );
}
