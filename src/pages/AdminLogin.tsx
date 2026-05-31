import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { STORE_NAME } from '@/lib/constants';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Usuario o contrasena incorrectos');
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#0F0F0F] flex items-center justify-center px-5"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className={`w-full max-w-[420px] transition-all duration-600 ${shake ? 'animate-[shake_0.3s_ease-in-out]' : 'animate-fade-up'}`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] text-white tracking-wide">
            {STORE_NAME}
          </h1>
          <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
            Panel de Administracion
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 md:p-12">
          {error && (
            <div className="mb-5 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-body text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                Usuario
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-[48px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#3A3A3A]"
                  placeholder="mardadmin"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                Contrasena
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] pl-10 pr-11 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#3A3A3A]"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#A1A1A1] transition-colors p-1"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-[48px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors rounded-lg mt-2"
            >
              Iniciar Sesion
            </button>
          </form>
        </div>

        {/* Hint */}
        <p className="text-center mt-6 font-body text-[12px] text-[#6B6B6B]">
          Credenciales: mardadmin / Marda2025!
        </p>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
