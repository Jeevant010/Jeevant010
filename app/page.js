import Bio from "../components/Bio";
import Section from "../components/Section";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        <Section title="Welcome">
          <p className="text-gray-600">Explore my projects and contributions below.</p>
        </Section>
        <Bio />
      </div>
    </main>
  );
}