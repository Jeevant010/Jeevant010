import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Jeevant010 | Portfolio",
  description: "Massive portfolio with projects and contributions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <Navbar />
          {children}
          <footer className="mt-16 py-10 text-center text-gray-500">
            © {new Date().getFullYear()} Jeevant010 — Built with Next.js & TailwindCSS
          </footer>
        </div>
      </body>
    </html>
  );
}