"use client";

import { login } from "@/lib/actions/auth.actions";
import { Fingerprint, Lock } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className={`w-full mt-8 py-4 font-mono text-xs font-bold tracking-[0.3em] uppercase transition-all duration-500 border ${pending ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' : 'bg-transparent border-white/10 text-slate-500 hover:border-white hover:text-white hover:bg-white/5'}`}
    >
      {pending ? "VERIFYING_IDENTITY..." : "INITIATE_HANDSHAKE"}
    </button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)] animate-pulse-slow pointer-events-none" />
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent top-1/2 -translate-y-1/2" />
      
      <div className="relative z-10 w-full max-w-md">
        
        {/* Icon */}
        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center relative">
            <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-20" />
            <Fingerprint className="w-10 h-10 text-white/50" />
          </div>
        </div>

        {/* The Form */}
        <form 
          action={async (formData) => {
            const res = await login(formData);
            if (res?.error) setError(res.error);
          }} 
          className="text-center"
        >
          <div className="relative group">
            <input 
              name="password" 
              type="password" 
              placeholder="ENTER ACCESS KEY" 
              required
              autoFocus
              className="w-full bg-black border-b border-white/20 py-4 text-center text-white text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-white/50 placeholder:text-white/10 transition-colors"
            />
            <Lock className="w-4 h-4 text-white/20 absolute right-0 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
          </div>

          {error && (
            <div className="mt-6 text-red-500 font-mono text-xs tracking-widest animate-pulse">
               {error}
            </div>
          )}

          <SubmitButton />
        </form>

        <div className="mt-16 text-center">
           <p className="text-[10px] text-white/20 font-mono">
             SECURE_CONNECTION // {new Date().getFullYear()} // JEEVANT_OS
           </p>
        </div>
      </div>
    </div>
  );
}