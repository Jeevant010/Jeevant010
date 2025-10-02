import Bio from '../components/Bio';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Bio />
        <div className="mt-10 text-center text-gray-500">
          <p>Welcome to my portfolio. Explore my projects and contributions!</p>
        </div>
      </div>
    </main>
  );
}