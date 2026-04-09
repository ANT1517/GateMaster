import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { 
  User, 
  QrCode, 
  Clock, 
  PlusCircle, 
  Download, 
  LogOut, 
  CheckCircle2, 
  History,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [passes, setPasses] = useState([]);
  const [reason, setReason] = useState("");
  const [entryStatus, setEntryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: passData } = await supabase
        .from("gate_passes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPasses(passData || []);

      const today = new Date().toISOString().split("T")[0];
      const { data: entryData } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("entry_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      setEntryStatus(entryData);

    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPass = async () => {
    if (!reason.trim()) {
      alert("Please specify a reason for your gate pass clearance.");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please login again.");

      const qrPayload = JSON.stringify({ 
        userId: user.id, 
        type: "gate_pass", 
        reason: reason, 
        timestamp: Date.now() 
      });

      const { error } = await supabase
        .from("gate_passes")
        .insert([{ 
          user_id: user.id, 
          reason: reason, 
          status: "pending", 
          qr_code: qrPayload,
          type: "regular"
        }]);

      if (error) throw error;
      
      setReason("");
      alert("Request Submitted: Awaiting administrator clearance.");
      await fetchStudentData();
    } catch (err) {
      console.error("Error requesting pass:", err);
      alert("System Overload: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadQR = (id, filename) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${filename}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="text-[var(--accent)] animate-pulse" size={48} strokeWidth={1} />
          <p className="text-[var(--text-muted)] font-bold text-sm tracking-widest uppercase">Initializing Portal...</p>
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
                Account Level: Student
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-[var(--text-main)]">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
             <p className="text-[var(--text-muted)] font-medium">Roll Number: <span className="text-[var(--text-main)] font-black">{profile?.roll_no}</span></p>
          </div>
          <div className="bg-white border border-[var(--border-subtle)] px-6 py-4 rounded-[20px] flex items-center gap-8 shadow-sm">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-60">Status Dashboard</span>
                <span className="text-sm font-bold flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${entryStatus?.status === 'inside' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                  {entryStatus?.status === 'inside' ? 'Inside Premises' : 'Outside Perimeter'}
                </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          <div className="lg:col-span-3 tb-card p-12 bg-white flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 text-[var(--accent)] font-black text-xs uppercase tracking-widest">
                <QrCode size={16} /> Identity Access 
              </div>
              <h2 className="text-3xl font-black tracking-tight">Your Digital Pass</h2>
              <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                Present this QR code at any entry or exit gate for automated identity verification.
              </p>
              <button 
                onClick={() => downloadQR("identity-qr", `ID_${profile?.roll_no}`)}
                className="btn-obsidian px-8 py-3.5 text-sm"
              >
                <Download size={18} /> Save Identity QR
              </button>
            </div>
            <div className="bg-[var(--bg-main)] p-8 rounded-[32px] border border-[var(--border-subtle)] shadow-inner flex items-center justify-center">
              <QRCodeCanvas 
                id="identity-qr"
                value={JSON.stringify({ userId: profile?.id, rollNo: profile?.roll_no, type: 'identity' })} 
                size={200}
                level="Q"
                includeMargin={false}
                bgColor="#F9F9F9"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10 flex flex-col justify-between">
            <div className="tb-card p-10 bg-white border border-[var(--border-subtle)] text-[var(--text-main)] relative z-10 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-6 flex items-center gap-2">
                 <Zap size={16} /> Request Pass
               </h3>
               <div className="space-y-6">
                  <p className="text-xl font-bold tracking-tight text-[var(--text-main)]">Generate temporary exit clearance</p>
                  <div className="flex flex-col gap-4">
                    <input 
                      id="request-reason"
                      name="reason"
                      type="text" 
                      placeholder="Specify reason for leave..." 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition-all placeholder:text-[var(--text-muted)]/50 text-[var(--text-main)] block w-full"
                    />
                    <button 
                      onClick={handleRequestPass}
                      disabled={submitting}
                      className={`bg-emerald-500 hover:bg-emerald-600 text-[#111111] w-full justify-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {submitting ? "Processing..." : "Process Request"} <ChevronRight size={18} />
                    </button>
                  </div>
               </div>
            </div>

            <div className="tb-card p-10 bg-white border-dashed border-[var(--border-subtle)]">
               <h3 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-6 flex items-center gap-2">
                <History size={16} /> Last Movement
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-40">Entry Time</p>
                    <p className="font-bold text-lg">{entryStatus?.entry_time ? new Date(entryStatus.entry_time).toLocaleTimeString([], { hour12: true }) : '--:--:--'}</p>
                  </div>
                  <CheckCircle2 size={24} className="text-emerald-500 opacity-40" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-40">Exit Time</p>
                    <p className="font-bold text-lg">{entryStatus?.exit_time ? new Date(entryStatus.exit_time).toLocaleTimeString([], { hour12: true }) : '--:--:--'}</p>
                  </div>
                  <History size={24} className="text-orange-500 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {passes.some(p => p.status === 'approved') && (
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-black tracking-tighter">Approved Gate Passes</h3>
              <div className="h-[2px] flex-1 bg-[var(--border-subtle)]"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {passes.filter(p => p.status === 'approved').map((pass) => (
                <div key={pass.id} className="tb-card p-8 bg-white border border-emerald-100 group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pass Ref No</span>
                      <h4 className="font-bold text-lg truncate w-32">{pass.reason}</h4>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <div className="bg-[var(--bg-main)] p-6 rounded-[32px] border border-[var(--border-subtle)] flex flex-col items-center gap-4">
                    <QRCodeCanvas id={`pass-${pass.id}`} value={pass.qr_code} size={140} level="Q" bgColor="#F9F9F9" />
                    <button 
                      onClick={() => downloadQR(`pass-${pass.id}`, `PASS_${profile?.roll_no}`)}
                      className="text-xs font-black text-[var(--accent)] tracking-widest uppercase hover:underline flex items-center gap-1 mt-2"
                    >
                      <Download size={14} /> Download Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
