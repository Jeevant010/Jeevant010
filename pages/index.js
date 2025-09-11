import Bio from '../components/Bio';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Achievements from '../components/Achievements';
import Schedules from '../components/Schedules';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Bio />
        <Projects />
        <Skills />
        <Achievements />
        <Schedules />
      </div>
    </div>
  );
}