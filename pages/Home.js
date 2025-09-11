import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Jeevant Portfolio</h1>
        <p className="text-lg mb-8">
          Welcome to Jeevant's personal website. Explore my projects and personal space!
        </p>
        <div className="bg-purple-100 p-4 rounded shadow">
          <p><strong>About me:</strong> I am a passionate developer building projects in Python, JavaScript, and more. Check out my work and get in touch!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}