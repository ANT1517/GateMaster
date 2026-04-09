import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserPlus, Mail, Lock, User, Hash, ChevronRight, ShieldCheck } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, full_name: fullName, roll_no: rollNo, email: email, role: "student" }]);

      if (profileError) throw profileError;

      alert("Registration Successful. Please Login.");
      navigate("/login");
    } catch (err) {
      console.error("Sign up error:", err.message);
      alert("Registration Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[var(--accent-glow)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="tb-card w-full max-w-md p-12 bg-white relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-white mb-6 shadow-sm">
            <UserPlus size={28} />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[var(--text-main)] mb-2">Join Access</h2>
          <p className="text-[var(--text-muted)] font-medium italic">Create your institutional identity</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] pl-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={16} />
                <input
                  type="text"
                  placeholder="Full Legal Name"
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] pl-2">Roll Number</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={16} />
                <input
                  type="text"
                  placeholder="ID REFERENCE"
                  required
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={16} />
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] pl-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-obsidian w-full justify-center py-4 text-lg font-extrabold tracking-tight"
          >
            {loading ? "Registering..." : "Create Account"}
            {!loading && <ChevronRight size={22} />}
          </button>
        </form>

        <div className="text-center mt-10 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-sm font-bold text-[var(--text-muted)]">
            Institutional Access?{" "}
            <Link to="/login" className="text-[var(--text-main)] underline underline-offset-4 decoration-[var(--accent-glow)] hover:decoration-[var(--accent)] transition-all">
              Redirect to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
