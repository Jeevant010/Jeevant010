import ProjectVault from "@/components/public/ProjectVault";
import { getLife } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Record · Jeevant Mudgil",
  description: "Every original public repository and product, with the real status of each.",
};

export default async function ProjectsPage() {
  const life = await getLife();
  return <ProjectVault projects={life.projects} />;
}
