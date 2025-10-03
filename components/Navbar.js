"use client";
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow mb-8">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-blue-700">Jeevant010</Link>
        <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
          <Link href="/" className="text-gray-700 hover:text-blue-500">Home</Link>
          <Link href="/projects" className="text-gray-700 hover:text-blue-500">Projects</Link>
          <Link href="/contributions" className="text-gray-700 hover:text-blue-500">Contributions</Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-500">About</Link>
          <Link href="/skills" className="text-gray-700 hover:text-blue-500">Skills</Link>
          <Link href="/achievements" className="text-gray-700 hover:text-blue-500">Achievements</Link>
          <Link href="/schedules" className="text-gray-700 hover:text-blue-500">Schedules</Link>
          <Link href="/blog" className="text-gray-700 hover:text-blue-500">Blog</Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-500">Contact</Link>
        </div>
      </div>
    </nav>
  );
}