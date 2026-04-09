import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, UserCheck, LayoutDashboard, ArrowRight, ArrowUpRight, Shield, User } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Ornament (TalentBridge Style Glow) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--accent-glow)] opacity-[0.07] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-glow)] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto w-full px-10 py-2 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--accent)] p-2 rounded-xl text-white">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tighter text-[var(--accent)] uppercase leading-none">GateMaster</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="pulse-dot"></div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Live System Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <Link to="/login" className="btn-ghost px-8 py-2.5 text-sm rounded-xl">
            Login
          </Link>
          <Link to="/signup" className="btn-obsidian px-8 py-2.5 text-sm rounded-xl">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center px-10 pt-2 pb-16 relative z-10">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold text-xs mb-10 shadow-sm uppercase tracking-widest">
           Secure Campus Management
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-[var(--text-main)] mb-10 leading-[0.95]">
          Seamless campus <br /> 
          <span className="opacity-40">access management.</span>
        </h1>
        
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          A secure, efficient, and automated solution for student entry and exit tracking. 
          Manage identity, verify passes, and monitor logs in one unified portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/login" className="btn-obsidian px-10 py-4.5 text-lg shadow-xl shadow-black/10">
            Get Started <ArrowRight size={22} />
          </Link>
          <Link to="/signup" className="btn-ghost px-10 py-4.5 text-lg bg-white/50 backdrop-blur-md">
            Create Account
          </Link>
        </div>
      </main>

      {/* Bento Navigation Cards */}
      <section className="max-w-7xl mx-auto w-full px-10 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <Link to="/login" className="tb-card group">
            <div className="bg-[var(--bg-main)] w-16 h-16 rounded-2xl flex items-center justify-center mb-12 border border-[var(--border-subtle)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
              <User size={28} strokeWidth={2.5} />
            </div>
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-3xl font-black tracking-tighter">Student Panel</h3>
               <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed font-medium">
              Validate your identity, track your entry status, and request digital gate passes for campus leave.
            </p>
            <div className="mt-auto flex items-center gap-2 font-bold text-[var(--text-main)] text-sm opacity-60 group-hover:opacity-100 transition-opacity">
               Authorized Entry Only <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/login" className="tb-card group">
            <div className="bg-[var(--bg-main)] w-16 h-16 rounded-2xl flex items-center justify-center mb-12 border border-[var(--border-subtle)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
              <Shield size={28} strokeWidth={2.5} />
            </div>
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-3xl font-black tracking-tighter">Guard Panel</h3>
               <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed font-medium">
              Manage checkpoint security by scanning student QR identities and verifying digital pass clearance.
            </p>
            <div className="mt-auto flex items-center gap-2 font-bold text-[var(--text-main)] text-sm opacity-60 group-hover:opacity-100 transition-opacity">
               Scanner Environment <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/login" className="tb-card group">
            <div className="bg-[var(--bg-main)] w-16 h-16 rounded-2xl flex items-center justify-center mb-12 border border-[var(--border-subtle)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
              <LayoutDashboard size={28} strokeWidth={2.5} />
            </div>
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-3xl font-black tracking-tighter">Admin Core</h3>
               <ArrowUpRight className="opacity-20 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed font-medium">
              Review live telemetry data, manage student profiles, and authorize high-priority pass requests.
            </p>
            <div className="mt-auto flex items-center gap-2 font-bold text-[var(--text-main)] text-sm opacity-60 group-hover:opacity-100 transition-opacity">
               System Management <ArrowRight size={14} />
            </div>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-10 py-16 border-t border-[var(--border-subtle)] bg-white/50 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--accent)] p-1.5 rounded-lg text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-tighter uppercase text-[var(--accent)]">GateMaster Systems</span>
        </div>
        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-40">
          &copy; 2026 GATEMASTER GLOBAL INFRASTRUCTURE
        </p>
      </footer>
    </div>
  );
}
