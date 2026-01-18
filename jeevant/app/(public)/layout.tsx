import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* --- Public Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            Jeevant<span className="text-blue-600">.Dev</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/projects" className="hover:text-blue-600 transition">Projects</Link>
            <Link href="/about" className="hover:text-blue-600 transition">About</Link>
          </div>

          {/* Login Button (Hidden Shortcut) */}
          <Link 
            href="/dashboard" 
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition"
          >
            Enter OS
          </Link>
        </div>
      </nav>

      {/* --- Main Content (Padded top for fixed navbar) --- */}
      <main className="flex-1 pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Jeevant Mudgil. Built with Next.js 15 & MongoDB.</p>
        </div>
      </footer>
    </div>
  );
}