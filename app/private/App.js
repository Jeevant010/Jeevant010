import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TaskSchedules from './taskschedules/page';
import SpacePlans from './spaceplans/page';

export default function App() {
  return (
    <Router>
      <header className="bg-pink-700 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛡️ Private Dashboard</h1>
        <nav className="flex gap-6">
          <Link to="/taskschedules" className="hover:underline">Tasks & Schedules</Link>
          <Link to="/spaceplans" className="hover:underline">Space Plans</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/taskschedules" element={<TaskSchedules />} />
          <Route path="/spaceplans" element={<SpacePlans />} />
          <Route path="*" element={<TaskSchedules />} /> {/* default route */}
        </Routes>
      </main>
    </Router>
  );
}