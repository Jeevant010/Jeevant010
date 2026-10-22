import { getApplications, createApplication } from "@/lib/actions/career.actions";
import { Building2 } from "lucide-react";
import { CareerBoard } from "@/components/features/CareerBoard";
import AddApplicationForm from "@/components/features/AddApplicationForm";
import PrivateShell from "@/components/layout/PrivateShell";

export const dynamic = "force-dynamic";

export default async function CareerKanban() {
  const applications = await getApplications();

  return (
    <PrivateShell
      eyebrow="Target acquisition log"
      title="Corp Infiltration"
      description="Every application, from first contact to signed offer."
      accent="pink"
      icon={<Building2 className="h-6 w-6 text-[#d8cfbe]" />}
    >
      <AddApplicationForm />

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <div className="panel-cyber p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">Total Targets</div>
          <div className="mt-2 text-3xl font-black text-[#d8cfbe]">{applications.length}</div>
        </div>
        <div className="panel-cyber p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">Interviews Active</div>
          <div className="mt-2 text-3xl font-black text-white">{applications.filter((a: any) => a.status === 'interview').length}</div>
        </div>
        <div className="panel-cyber p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-shell-muted">Offers Secured</div>
          <div className="mt-2 text-3xl font-black text-[#c8b48a]">{applications.filter((a: any) => a.status === 'offer').length}</div>
        </div>
      </div>

      <CareerBoard initialApplications={applications} />
    </PrivateShell>
  );
}
