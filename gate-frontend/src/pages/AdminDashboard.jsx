import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { 
  Users, 
  FileCheck, 
  History, 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Activity, 
  Database, 
  CheckCircle2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [passes, setPasses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: passData, error: passError } = await supabase
        .from("gate_passes")
        .select(`*, profiles (full_name, roll_no)`)
        .order("created_at", { ascending: false });

      if (passError) throw passError;
      setPasses(passData || []);

      const { data: logData, error: logError } = await supabase
        .from("daily_entries")
        .select(`*, profiles (full_name, roll_no)`)
        .order("entry_time", { ascending: false });

      if (logError) throw logError;
      setLogs(logData || []);

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("gate_passes")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("System Overload: Authentication Failed.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gate_passes' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_entries' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredLogs = logs.filter(log => 
    log.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.profiles?.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRegularPasses = passes.filter(p => p.status === 'pending' && (!p.type || p.type === 'regular'));
  const pendingOverrides = passes.filter(p => p.status === 'pending' && p.type === 'override');

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="text-[var(--accent)] animate-pulse" size={48} strokeWidth={1} />
          <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest">Portal Center Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-20 font-sans">
      <nav className="border-b border-[var(--border-subtle)] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] p-2 rounded-xl text-white">
              <ShieldCheck size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tighter uppercase">GateMaster</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost px-6 py-2.5 text-xs rounded-xl">
             Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 mt-12 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/5 text-[var(--accent)] font-bold text-[10px] uppercase tracking-widest">
                 System Role: Administrator
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)]">Control Center</h1>
              <p className="text-[var(--text-muted)] font-medium">Monitor and authorize campus perimeter access in real-time.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="tb-card p-8 bg-white border-b-4 border-b-emerald-500">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Live Inside</span>
            <p className="text-4xl font-black">{logs.filter(l => l.status === 'inside').length}</p>
          </div>
          <div className="tb-card p-8 bg-white border-b-4 border-b-orange-400">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Requests</span>
            <p className="text-4xl font-black">{passes.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className="tb-card p-8 bg-white border-b-4 border-b-[#8D8DFF]">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Total Movement</span>
            <p className="text-4xl font-black">{logs.length}</p>
          </div>
          <div className="tb-card p-8 bg-[#111111] text-white">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 font-semibold">Security State</span>
            <p className="text-3xl font-black italic text-emerald-400 lowercase tracking-widest">stable_link</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          <section className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                  <FileCheck size={24} strokeWidth={2.5} /> Gate Pass Requests
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {pendingRegularPasses.length === 0 ? (
                  <div className="py-16 tb-card bg-white/50 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center">
                    <Database size={40} className="opacity-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No Regular Requests</p>
                  </div>
                ) : (
                  pendingRegularPasses.map((pass) => (
                    <div key={pass.id} className="tb-card p-8 bg-white group hover:border-[var(--accent)] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="font-extrabold text-xl tracking-tight">{pass.profiles?.full_name}</span>
                            <span className="text-[10px] font-black bg-[var(--bg-main)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] uppercase">ID: {pass.profiles?.roll_no}</span>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-muted)] leading-relaxed italic">Reason: {pass.reason}</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-60 flex items-center gap-1 uppercase tracking-widest">
                            <History size={12} /> {new Date(pass.created_at).toLocaleString([], { hour12: true })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(pass.id, 'approved')}
                            className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-[#111111] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                          >
                            <Check size={22} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(pass.id, 'rejected')}
                            className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                          >
                            <X size={22} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2 text-orange-500">
                  <ShieldCheck size={24} strokeWidth={2.5} /> System Overrides
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {pendingOverrides.length === 0 ? (
                  <div className="py-16 tb-card bg-white/50 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center">
                    <Database size={40} className="opacity-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No Override Requests</p>
                  </div>
                ) : (
                  pendingOverrides.map((pass) => (
                    <div key={pass.id} className="tb-card p-8 bg-white border-l-4 border-l-orange-500 group hover:border-[var(--accent)] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="font-extrabold text-xl tracking-tight">{pass.profiles?.full_name}</span>
                            <span className="text-[10px] font-black bg-[var(--bg-main)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] uppercase">ID: {pass.profiles?.roll_no}</span>
                          </div>
                          <p className="text-sm font-semibold text-orange-600 leading-relaxed italic uppercase tracking-tighter">Multiple Entry Attempt Detected</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] opacity-60 flex items-center gap-1 uppercase tracking-widest">
                            <History size={12} /> {new Date(pass.created_at).toLocaleString([], { hour12: true })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(pass.id, 'approved')}
                            className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                          >
                            <Check size={22} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(pass.id, 'rejected')}
                            className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                          >
                            <X size={22} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
              <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                <LayoutDashboard size={24} strokeWidth={2.5} /> Live Portal Activity
              </h2>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={16} />
                <input 
                  type="text" 
                  placeholder="FILTER SEARCH..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-[var(--border-subtle)] rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:ring-4 focus:ring-[var(--accent)]/5 focus:outline-none transition-all w-full md:w-72"
                />
              </div>
            </div>

            <div className="tb-card bg-white p-0 overflow-hidden shadow-sm">
               <div className="max-h-[600px] overflow-y-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                       <th className="px-8 py-5">Portal Identity</th>
                       <th className="px-8 py-5">Entry Sequence</th>
                       <th className="px-8 py-5">Exit Sequence</th>
                       <th className="px-8 py-5 text-center">State</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[var(--border-subtle)]/50">
                     {filteredLogs.length === 0 ? (
                       <tr>
                         <td colSpan="4" className="px-8 py-16 text-center text-sm font-bold text-[var(--text-muted)] italic">Awaiting Next Activity Interrupt</td>
                       </tr>
                     ) : (
                       filteredLogs.map((log) => (
                         <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-8 py-6">
                             <div className="flex flex-col translate-x-0 group-hover:translate-x-1 transition-transform">
                               <span className="font-extrabold text-sm">{log.profiles?.full_name}</span>
                               <span className="text-[11px] text-[var(--text-muted)] font-medium">{log.profiles?.roll_no}</span>
                             </div>
                           </td>
                           <td className="px-8 py-6 text-xs font-bold text-[var(--text-main)] tabular-nums">
                              {log.entry_time ? new Date(log.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--:--'}
                           </td>
                           <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] tabular-nums">
                              {log.exit_time ? new Date(log.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--:--'}
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                  log.status === 'inside' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200 opacity-60'
                                }`}>
                                  {log.status === 'inside' ? (
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Inside</span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 underline decoration-gray-300">Exited</span>
                                  )}
                                </span>
                              </div>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
            
            <div className="flex items-center gap-3 bg-[var(--accent)] p-5 text-white rounded-[24px] shadow-lg shadow-black/10">
               <Activity size={18} className="text-emerald-400" />
               <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-90 italic">Data Pipeline Sync Overide: Live Encryption Active</p>
            </div>
          </section>

        </div>

        {/* 🔹 Access Clearance History */}
        <section className="space-y-8 pt-8 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2 text-[var(--text-main)]">
              <Database size={24} strokeWidth={2.5} className="text-emerald-500" /> Access Clearance History
            </h2>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">System Audit Trail</div>
          </div>

          <div className="tb-card bg-white p-0 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                     <th className="px-8 py-5">Applicant Identity</th>
                     <th className="px-8 py-5">Type</th>
                     <th className="px-8 py-5">Reason</th>
                     <th className="px-8 py-5">Generation Date</th>
                     <th className="px-8 py-5 text-center">Clearance Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[var(--border-subtle)]/50 text-sm">
                   {passes.length === 0 ? (
                     <tr>
                       <td colSpan="5" className="px-8 py-16 text-center text-sm font-bold text-[var(--text-muted)] italic">Awaiting Next Activity Interrupt</td>
                     </tr>
                   ) : (
                     passes.map((pass) => (
                       <tr key={pass.id} className="hover:bg-emerald-50/10 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-[var(--text-main)]">{pass.profiles?.full_name}</span>
                              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">{pass.profiles?.roll_no}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border ${
                              pass.type === 'override' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {pass.type || 'regular'}
                            </span>
                         </td>
                         <td className="px-8 py-6 font-medium text-[var(--text-muted)] italic max-w-xs truncate">
                            "{pass.reason}"
                         </td>
                         <td className="px-8 py-6 text-[10px] font-bold text-[var(--text-muted)] tabular-nums uppercase tracking-widest">
                            {new Date(pass.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                                pass.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                pass.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-orange-50 text-orange-700 border-orange-100'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  pass.status === 'approved' ? 'bg-emerald-500' :
                                  pass.status === 'rejected' ? 'bg-red-500' :
                                  'bg-orange-500 animate-pulse'
                                }`}></div>
                                {pass.status}
                              </span>
                            </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
