export default function Bio() {
  return (
    <section className="bg-white rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row items-center gap-4">
      <img
        src="https://avatars.githubusercontent.com/u/170954682?v=4"
        alt="Jeevant"
        className="w-20 h-20 rounded-full border-2 border-blue-400"
      />
      <div>
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Hi, I'm Jeevant 👋</h1>
        <p className="text-gray-700 text-lg mb-2">
          Full-stack developer. Passionate about web tech, backend engineering, and building scalable, impactful products. Welcome to my portfolio!
        </p>
        <p className="text-blue-500">GitHub: <a href="https://github.com/Jeevant010" target="_blank" rel="noopener noreferrer">@Jeevant010</a></p>
      </div>
    </section>
  );
}