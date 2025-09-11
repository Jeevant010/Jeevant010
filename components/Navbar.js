import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-purple-700 p-4 text-white">
      <ul className="flex space-x-4">
        <li>
          <Link href="/">
            <span className="font-bold hover:underline cursor-pointer">Home</span>
          </Link>
        </li>
        <li>
          <Link href="/projects">
            <span className="hover:underline cursor-pointer">Projects</span>
          </Link>
        </li>
        <li>
          <Link href="/personal-space">
            <span className="hover:underline cursor-pointer">Personal Space</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}