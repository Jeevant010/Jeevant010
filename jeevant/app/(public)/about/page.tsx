import { Briefcase, GraduationCap, Trophy, Code2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-20 py-10">
      
      {/* --- HEADER --- */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          <span className="text-blue-500">/</span>about_me
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          3rd Year CSE Student at IIIT Surat. Transforming complex data into 
          intelligent full-stack applications.
        </p>
      </section>

      {/* --- EXPERIENCE TIMELINE --- */}
      <section>
        <div className="flex items-center gap-3 mb-10">
          <Briefcase className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Experience</h2>
        </div>
        
        <div className="border-l-2 border-slate-800 ml-3 space-y-12">
          {/* Experience 1 */}
          <div className="relative pl-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-slate-950"></div>
            <div className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition">
              <span className="text-xs font-mono text-blue-400 mb-1 block">Sept 2025 - Present</span>
              <h3 className="text-xl font-bold text-white">Virtual Intern</h3>
              <p className="text-slate-400 font-medium">AICTE - SmartBridge - ServiceNow</p>
              <p className="text-slate-500 mt-4 leading-relaxed">
                Building workflows on the ServiceNow platform using JavaScript and Glide scripting. 
                Developing catalog items and practicing enterprise data modeling.
              </p>
            </div>
          </div>

          {/* Experience 2 */}
          <div className="relative pl-8">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-950"></div>
            <div className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition">
              <span className="text-xs font-mono text-slate-500 mb-1 block">2025 - Present</span>
              <h3 className="text-xl font-bold text-white">Technical Interviewer (Member)</h3>
              <p className="text-slate-400 font-medium">Google Developer Groups (GDG) - IIIT Surat</p>
              <p className="text-slate-500 mt-4 leading-relaxed">
                Conducting technical interviews for junior developers. Evaluating DSA fundamentals 
                and ML concepts using structured rubrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- EDUCATION & ACHIEVEMENTS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Education */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Education</h2>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white">B.Tech in Computer Science</h3>
            <p className="text-slate-400">IIIT Surat</p>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                CGPA: 8.63
              </div>
              <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full">
                2023 - 2027
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Achievements</h2>
          </div>
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition">AlgoUniversity Fellow</h4>
                <p className="text-xs text-slate-500">Qualified Stage 2 (Top 4k of 20k+)</p>
              </div>
              <Trophy className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition" />
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition">HackOdisha 4.0 Finalist</h4>
                <p className="text-xs text-slate-500">Top 5% - Built Fintech dApp</p>
              </div>
              <Trophy className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition" />
            </div>
            <div className="glass-card p-4 rounded-xl flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition">LeetCode Streak</h4>
                <p className="text-xs text-slate-500">50 & 100 Day Badges</p>
              </div>
              <Code2 className="w-5 h-5 text-slate-600 group-hover:text-green-400 transition" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}