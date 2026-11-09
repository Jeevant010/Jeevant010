import CinematicHome from "@/components/public/CinematicHome";
import { getLife } from "@/lib/catalog/live";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jeevant Mudgil · Founder, engineer, builder",
  description:
    "The live record of Jeevant Mudgil: founder of Scholar Dive, AI/ML lead, backend engineer, and the public repositories behind the work.",
};

export default async function HomePage() {
  const life = await getLife();
  return <CinematicHome life={life} />;
}
