import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Jeevant Portfolio</h1>
        <p className="text-lg">Welcome to Jeevant's personal website. Explore my projects and personal space!</p>
      </main>
      <Footer />
    </div>
  );
}