"use client";

import SortableList from "@/components/features/SortableList";
import ProjectRow from "@/components/features/ProjectRow";

export default function SortableProjectList({ projects }: { projects: any[] }) {
  return (
    <SortableList 
      items={projects} 
      modelName="Project" 
      revalidatePaths={["/cms/projects", "/projects", "/"]}
      renderItem={(p) => (
        <div className="p-4 hover:bg-[#1a1a1a] transition group bg-[#121212]">
           <ProjectRow project={p} /> 
        </div>
      )}
    />
  );
}