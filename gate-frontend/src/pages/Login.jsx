import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      localStorage.setItem("user", JSON.stringify({ ...data.user, role: profile.role }));

      if (profile.role === "admin") navigate("/admin");
      else if (profile.role === "student") navigate("/student");
      else navigate("/guard");
    } catch (err) {
      console.error("Login error:", err.message);
      alert("Authentication Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[var(--accent-glow)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="tb-card w-full max-w-md p-12 bg-white relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-white mb-6">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[var(--text-main)] mb-2">Welcome Back</h2>
          <p className="text-[var(--text-muted)] font-medium">Please enter your institutional credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={18} />
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest pl-2">Security Token</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-40" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[var(--accent-glow)]/10 transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-40"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-obsidian w-full justify-center py-4.5 text-lg font-extrabold tracking-tight transition-all active:scale-[0.98]"
          >
            {loading ? "Authorizing..." : "Authenticate"}
            {!loading && <ChevronRight size={22} />}
          </button>
        </form>

        <div className="text-center mt-10 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-sm font-bold text-[var(--text-muted)]">
            New to GateMaster?{" "}
            <Link to="/signup" className="text-[var(--text-main)] underline underline-offset-4 decoration-[var(--accent-glow)] hover:decoration-[var(--accent)] transition-all">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
