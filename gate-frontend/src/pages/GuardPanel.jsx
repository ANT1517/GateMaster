import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../supabaseClient";
import { 
  ShieldCheck, 
  Scan, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  History,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GuardPanel() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [lastActivity, setLastActivity] = useState([]);
  const [canRequestOverride, setCanRequestOverride] = useState(null);
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (!result || loading) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const data = JSON.parse(result[0].rawValue);
      const { userId, type } = data;

      if (type === "identity" || type === "gate_pass") {
        await processMovement(userId, type);
      } else {
        throw new Error("Unknown QR Type");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setStatusMessage({ type: "error", text: "Invalid Token: Authentication Denied" });
    } finally {
      setLoading(false);
      // Only auto-hide if it's not a success message (which might be the override notification)
      // and only if it's a simple scan message
      setTimeout(() => {
        setStatusMessage(prev => {
          if (prev?.text?.includes("Override") || prev?.text?.includes("Waiting")) return prev;
          return null;
        });
      }, 4000);
    }
  };

  const processMovement = async (userId, type) => {
    const today = new Date().toISOString().split("T")[0];
    const { data: currentLogs } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .order("entry_time", { ascending: false });

    const latestLog = currentLogs?.[0];
    
    // Check for approved override that is newer than the last exit
    const { data: latestOverride } = await supabase
      .from("gate_passes")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "override")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isOverrideValid = latestOverride && (!latestLog || (latestLog.exit_time && new Date(latestOverride.created_at) > new Date(latestLog.exit_time)));

    // Anti-Double Entry Logic
    if (latestLog && latestLog.status === "exited" && !isOverrideValid) {
       setStatusMessage({ type: "error", text: "Access Denied: Limit Reached. Requesting Override..." });
       
       // Check if an override is already pending to avoid duplicates
       const { data: existingPending } = await supabase
         .from("gate_passes")
         .select("id")
         .eq("user_id", userId)
         .eq("type", "override")
         .eq("status", "pending")
         .maybeSingle();

       if (!existingPending) {
         const { error } = await supabase
           .from("gate_passes")
           .insert([{ 
             user_id: userId, 
             reason: "Automated Multi-Entry Access Block Override", 
             type: "override",
             status: "pending" 
           }]);

         if (error) {
           setStatusMessage({ type: "error", text: "Access Denied. Failed to signal administrator." });
         } else {
           setStatusMessage({ type: "success", text: "Limit Detected: Override request automatically sent to administrator." });
         }
       } else {
         setStatusMessage({ type: "success", text: "Waiting for Admin Approval: Override request already in queue." });
       }
       return;
    }

    setCanRequestOverride(null);

    if (latestLog && latestLog.status === "inside") {
      const { error } = await supabase
        .from("daily_entries")
        .update({ exit_time: new Date().toISOString(), status: "exited" })
        .eq("id", latestLog.id);
      
      if (error) throw error;
      setStatusMessage({ type: "success", text: "Exit Authorized: Logged Successfully" });
      updateActivityLog(userId, "Exit Authorized");
    } else {
      const { error } = await supabase
        .from("daily_entries")
        .insert([{ user_id: userId, status: "inside", date: today }]);
      
      if (error) throw error;
      setStatusMessage({ type: "success", text: "Entry Authorized: Welcome Back" });
      updateActivityLog(userId, "Entry Authorized");
    }
  };

  const handleRequestOverride = async () => {
    if (!canRequestOverride) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("gate_passes")
        .insert([{ 
          user_id: canRequestOverride, 
          reason: "Manual Re-entry/Exit Authorization Required", 
          type: "override",
          status: "pending" 
        }]);

      if (error) throw error;
      setStatusMessage({ type: "success", text: "Override Requested: Awaiting Admin Approval" });
      setCanRequestOverride(null);
    } catch (err) {
      console.error("Override request error:", err);
      setStatusMessage({ type: "error", text: "Failed to request override" });
    } finally {
      setLoading(false);
    }
  };

  const updateActivityLog = async (userId, action) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, roll_no")
      .eq("id", userId)
      .single();

    setLastActivity(prev => [
      { name: profile?.full_name || "Unknown", roll: profile?.roll_no || "N/A", action, time: new Date().toLocaleTimeString([], { hour12: true }) },
      ...prev.slice(0, 5)
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans overflow-hidden">
      <header className="border-b border-[var(--border-subtle)] bg-white px-10 py-6 flex justify-between items-center shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#111111] p-2.5 rounded-xl text-white">
            <ShieldCheck size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tighter uppercase leading-none">Security Scanner</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="pulse-dot"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Live Access System</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost px-6 py-2.5 text-xs rounded-xl">
          Sign Out
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-10 gap-10 overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-glow)] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex-1 flex flex-col gap-10 z-10">
          <div className="tb-card bg-white flex-1 flex flex-col items-center justify-center p-12 lg:p-20 relative overflow-hidden">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest mb-4">Portal Input 01</div>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#111111]">Verify Identity</h2>
            </div>

            <div className="w-full max-w-sm aspect-square bg-gray-50 rounded-[48px] border-4 border-white shadow-2xl relative overflow-hidden flex items-center justify-center ring-1 ring-[var(--border-subtle)]">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-[#111111] opacity-[0.02]"></div>
                <div className="w-full h-full p-4 relative z-10">
                   <Scanner onScan={handleScan} styles={{ container: { width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden' } }} />
                </div>
                
                {loading && (
                   <div className="absolute inset-0 bg-[#111111]/10 backdrop-blur-sm flex items-center justify-center z-20">
                     <div className="bg-white p-4 rounded-3xl shadow-xl">
                        <Activity className="text-[#111111] animate-pulse" size={40} />
                     </div>
                   </div>
                )}
            </div>

            <div className={`mt-12 w-full max-w-md transition-all duration-500 transform ${
              !statusMessage ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
            }`}>
              <div className={`tb-card p-8 border-l-[6px] transition-colors ${
                statusMessage?.type === 'error' ? 'border-l-red-500 bg-red-50/50' : 'border-l-emerald-500 bg-emerald-50/50'
              }`}>
                <div className="flex items-start gap-5">
                  <div className={`p-2 rounded-2xl ${statusMessage?.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {statusMessage?.type === 'error' ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="font-black text-[10px] uppercase tracking-widest opacity-60">Authentication Alert</p>
                    <p className="font-extrabold text-lg leading-tight">{statusMessage?.text}</p>
                    {canRequestOverride && (
                      <button 
                        onClick={handleRequestOverride}
                        className="mt-4 bg-[#111111] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck size={14} /> Authorize Override Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[480px] flex flex-col gap-10 z-10">
          <div className="tb-card bg-[#111111] text-white p-10 flex flex-col flex-1 shadow-2xl shadow-black/20">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#8D8DFF] mb-10 flex items-center gap-3">
              <History size={18} /> Daily Transaction Log
            </h3>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
              {lastActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-12">
                   <Smartphone size={64} strokeWidth={1} />
                   <p className="mt-4 font-black uppercase text-xs tracking-widest">Awaiting scanner link</p>
                </div>
              ) : (
                lastActivity.map((act, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/[0.08] hover:border-white/20">
                    <div className="flex justify-between items-start mb-4">
                       <span className="font-black text-base truncate pr-4 italic underline decoration-[#8D8DFF] decoration-2 underline-offset-4">{act.name}</span>
                       <span className="text-[10px] font-black bg-white/10 px-2.5 py-1 rounded-xl uppercase tracking-tighter opacity-60 tabular-nums">{act.time}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#111111]/40 rounded-2xl p-2 border border-white/5">
                      <span className="text-xs font-bold text-gray-400 pl-2">ID: {act.roll}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl flex items-center gap-2 ${
                        act.action.includes('Entry') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {act.action} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-10 pt-10 border-t border-white/10 flex flex-col gap-3">
               <div className="flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Scanner Link</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
               </div>
               <div className="flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Encryption Level</span>
                  <span className="text-[10px] font-bold text-[#8D8DFF] uppercase tracking-widest">Multi-Auth</span>
               </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
