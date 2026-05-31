import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { STORE_NAME } from '@/lib/constants';
import { Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Usuario o contrasena incorrectos');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0F0F0F] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white tracking-wide">{STORE_NAME}</h1>
          <p className="font-body text-sm text-[#6B6B6B] mt-1">Panel de Administracion</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1A1A] border border-[#2A2A2A] p-8"
        >
          {error && (
            <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-body text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="font-body text-xs uppercase tracking-[1.5px] text-[#6B6B6B] mb-2 block">
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
                className="w-full h-[48px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
                placeholder="mardadmin"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="font-body text-xs uppercase tracking-[1.5px] text-[#6B6B6B] mb-2 block">
              Contrasena
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[48px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[48px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors rounded-lg"
          >
            INGRESAR
          </button>
        </form>

        <p className="text-center mt-6 font-body text-xs text-[#6B6B6B]">
          Credenciales: mardadmin / Marda2025!
        </p>
      </div>
    </div>
  );
}
