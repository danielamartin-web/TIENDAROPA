import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { STORE_NAME } from '@/lib/constants';
import { api, ApiError } from '@/lib/api';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

type Mode = 'loading' | 'login' | 'setup';

interface SetupStatusResponse {
  adminExists: boolean;
}

interface AuthResponse {
  token: string;
  username: string;
}

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const navigate = useNavigate();

  // Si ya esta logueado, ir directo al dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Al montar: chequear si necesita setup
  useEffect(() => {
    let cancelled = false;
    api
      .get<SetupStatusResponse>('/api/auth/setup-status')
      .then((data) => {
        if (cancelled) return;
        setMode(data.adminExists ? 'login' : 'setup');
      })
      .catch(() => {
        if (cancelled) return;
        // Si falla, asumir login (el usuario vera el error real en submit)
        setMode('login');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shakeError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const success = await login(username, password);
    setSubmitting(false);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      shakeError(useAuthStore.getState().loginError ?? 'Usuario o contrasena incorrectos');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      shakeError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      shakeError('Las contrasenas no coinciden');
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      shakeError('Usuario invalido: solo letras, numeros, . _ -');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<AuthResponse>('/api/auth/setup', {
        username,
        password,
        confirmPassword,
      });
      // Auto-login con el token recibido
      useAuthStore.setState({
        isAuthenticated: true,
        isAdmin: true,
        isCustomer: false,
        username: res.username,
        customerName: null,
        token: res.token,
        tokenExpiresAt: Date.now() + 8 * 60 * 60 * 1000,
        loginError: null,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403 && err.message === 'setup_already_completed') {
          shakeError('Ya hay un admin creado. Recargando...');
          setTimeout(() => setMode('login'), 1200);
        } else if (err.message === 'passwords_do_not_match') {
          shakeError('Las contrasenas no coinciden');
        } else if (err.message === 'username_invalid_chars') {
          shakeError('Usuario invalido: solo letras, numeros, . _ -');
        } else {
          shakeError(err.message);
        }
      } else {
        shakeError('No se pudo crear el admin. Verifica la conexion al servidor.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6F1219] border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-xs text-[#6B6B6B] uppercase tracking-[2px]">Cargando</p>
        </div>
      </div>
    );
  }

  const isSetup = mode === 'setup';

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
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] text-white tracking-wide">{STORE_NAME}</h1>
          <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
            {isSetup ? 'Crear cuenta de administrador' : 'Panel de Administracion'}
          </p>
        </div>

        {isSetup && (
          <div className="mb-5 p-4 bg-[#6F1219]/10 border border-[#6F1219]/30 rounded-lg flex items-start gap-3">
            <Sparkles size={18} className="text-[#D4A574] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-[13px] text-white mb-1">Primera vez aca</p>
              <p className="font-body text-[12px] text-[#A1A1A1]">
                Eligi tu usuario y contrasena para crear el admin. Esta opcion solo aparece una vez.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 md:p-12">
          {error && (
            <div className="mb-5 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-body text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-5">
            <div>
              <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                {isSetup ? 'Usuario nuevo' : 'Usuario'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-[48px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#3A3A3A]"
                  placeholder={isSetup ? 'mardadmin' : 'Usuario'}
                  required
                  minLength={isSetup ? 3 : undefined}
                  maxLength={64}
                  autoComplete={isSetup ? 'username' : 'username'}
                />
              </div>
              {isSetup && (
                <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
                  Min 3 caracteres. Letras, numeros, . _ -
                </p>
              )}
            </div>

            <div>
              <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                Contrasena
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] pl-10 pr-11 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#3A3A3A]"
                  placeholder="••••••••"
                  required
                  minLength={isSetup ? 8 : undefined}
                  autoComplete={isSetup ? 'new-password' : 'current-password'}
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
              {isSetup && (
                <p className="font-body text-[11px] text-[#6B6B6B] mt-1">Min 8 caracteres</p>
              )}
            </div>

            {isSetup && (
              <div>
                <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
                  Confirmar contrasena
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[48px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors placeholder:text-[#3A3A3A]"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[48px] bg-[#6F1219] text-white font-body text-sm font-medium uppercase tracking-[1px] hover:bg-[#5A0E14] transition-colors rounded-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? isSetup
                  ? 'Creando admin...'
                  : 'Iniciando sesion...'
                : isSetup
                ? 'Crear admin y entrar'
                : 'Iniciar Sesion'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-body text-[12px] text-[#6B6B6B]">
          {isSetup
            ? 'Esta es tu unica oportunidad de crear el admin desde el sitio. Anota tus credenciales.'
            : 'Acceso restringido. Si olvidaste tu contrasena, contacta al administrador.'}
        </p>
      </div>

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
