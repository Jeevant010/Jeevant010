import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PersonalSpace() {
  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4">Personal Space</h2>
        <p className="bg-purple-100 p-4 rounded-lg">This is your private space, Jeevant!</p>
      </main>
      <Footer />
    </div>
  );
}