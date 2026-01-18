"use client";

import { sendMessage } from "@/lib/actions/contact.actions";
import { Radio, Send, Zap, ShieldCheck, Activity } from "lucide-react";
import { useState } from "react";

export default function ContactComms() {
  const [status, setStatus] = useState("IDLE"); // IDLE, SENDING, SENT

  async function handleSubmit(formData: FormData) {
    setStatus("SENDING");
    // Simulate network delay for effect
    await new Promise(r => setTimeout(r, 1500));
    await sendMessage(formData);
    setStatus("SENT");
  }

  if (status === "SENT") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-900/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-widest uppercase">Transmission Received</h1>
          <p className="text-green-500 font-mono text-sm">
            // PACKET_VERIFIED // ENCRYPTION_VALID<br/>
            // JEEVANT_OS WILL RESPOND SHORTLY.
          </p>
          <button onClick={() => setStatus("IDLE")} className="mt-8 text-slate-500 hover:text-white underline text-xs uppercase tracking-widest">
            Send Another Packet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 p-6 font-mono relative overflow-hidden -m-8 flex items-center justify-center">
      
      {/* NOISE BG */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* GRID LINES */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10 bg-[#0a0a0a] shadow-2xl">
        
        {/* LEFT: STATUS PANEL */}
        <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_blue] animate-scan" />
          
          <div>
            <div className="flex items-center gap-3 mb-8 text-blue-500">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase">Frequency: 140.85</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase leading-tight mb-4">
              Establish<br/><span className="text-blue-600">Uplink</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Open a secure channel to discuss project collaboration, freelance contracts, or classified intel.
            </p>
          </div>

          <div className="space-y-4 mt-12">
            <div className="flex items-center gap-4 text-xs font-bold uppercase text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              System Status: Online
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Encryption: AES-256
            </div>
            <div className="h-16 w-full bg-black border border-white/5 relative flex items-end p-1 gap-1">
              {/* Fake Audio Visualizer */}
              {[40, 70, 30, 80, 50, 90, 20, 60, 40, 70].map((h, i) => (
                <div key={i} className="w-full bg-blue-900/40 hover:bg-blue-500 transition-colors duration-300" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: INPUT FORM */}
        <div className="p-8 bg-[#050505]">
          <form action={handleSubmit} className="space-y-8">
            
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-blue-900 group-focus-within:text-blue-500 transition-colors">
                Identity (Name)
              </label>
              <input 
                name="senderName" 
                required 
                className="w-full bg-transparent border-b border-white/10 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors uppercase"
                placeholder="UNKNOWN AGENT"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-blue-900 group-focus-within:text-blue-500 transition-colors">
                Return Frequency (Email)
              </label>
              <input 
                name="senderContact" 
                required 
                className="w-full bg-transparent border-b border-white/10 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors uppercase"
                placeholder="AGENT@CORP.NET"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-blue-900 group-focus-within:text-blue-500 transition-colors">
                Packet Data (Message)
              </label>
              <textarea 
                name="content" 
                required 
                rows={4}
                className="w-full bg-transparent border-b border-white/10 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors uppercase resize-none custom-scrollbar"
                placeholder="TRANSMIT MESSAGE HERE..."
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <input type="radio" name="priority" value="low" id="p-low" defaultChecked className="accent-blue-500" />
                <label htmlFor="p-low" className="text-[10px] uppercase font-bold text-slate-500">Standard</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" name="priority" value="high" id="p-high" className="accent-red-500" />
                <label htmlFor="p-high" className="text-[10px] uppercase font-bold text-red-500">Priority 1</label>
              </div>
            </div>

            <button 
              disabled={status === "SENDING"}
              className="w-full py-4 bg-blue-900/10 border border-blue-600 text-blue-500 font-bold uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "SENDING" ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" /> Transmitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Initiate Transfer
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}