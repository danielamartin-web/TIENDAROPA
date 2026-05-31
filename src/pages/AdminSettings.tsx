import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_INSTAGRAM,
  DEFAULT_FACEBOOK,
  DEFAULT_TIKTOK,
  DEFAULT_ADDRESS,
  DEFAULT_HOURS,
  DEFAULT_EMAIL,
} from '@/lib/constants';
import { Settings, ArrowLeft, Save } from 'lucide-react';

export default function AdminSettings() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/admin/login');
  }, [isAuthenticated, isAdmin, navigate]);

  const [settings, setSettings] = useState({
    whatsapp: DEFAULT_WHATSAPP_NUMBER,
    instagram: DEFAULT_INSTAGRAM,
    facebook: DEFAULT_FACEBOOK,
    tiktok: DEFAULT_TIKTOK,
    address: DEFAULT_ADDRESS,
    hours: DEFAULT_HOURS,
    email: DEFAULT_EMAIL,
    storeTitle: 'MARDA - Ropa Interior y Juvenil',
  });

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    alert('Configuracion guardada (modo demo)');
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0F0F0F] text-white">
      <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="text-[#6B6B6B] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-display text-xl tracking-wide">MARDA</span>
          <span className="font-body text-xs text-[#6B6B6B] uppercase tracking-wider">Admin</span>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-[calc(100dvh-64px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {[
              { icon: Settings, label: 'Dashboard', to: '/admin/dashboard' },
              { icon: Settings, label: 'Productos', to: '/admin/products' },
              { icon: Settings, label: 'Pedidos', to: '/admin/orders' },
              { icon: Settings, label: 'Configuracion', to: '/admin/settings', active: true },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 font-body text-sm rounded-lg transition-colors ${
                  item.active
                    ? 'bg-[#6F1219]/15 text-white border-l-[3px] border-[#6F1219]'
                    : 'text-[#6B6B6B] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <h1 className="font-display text-2xl mb-6">Configuracion</h1>

          <div className="max-w-2xl space-y-6">
            {/* Social Links */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5">
              <h2 className="font-display text-lg mb-4">Redes Sociales</h2>
              <div className="space-y-4">
                {[
                  { label: 'WhatsApp (numero)', field: 'whatsapp', placeholder: '5491112345678' },
                  { label: 'Instagram (usuario)', field: 'instagram', placeholder: 'marda.oficial' },
                  { label: 'Facebook (pagina)', field: 'facebook', placeholder: 'mardaoficial' },
                  { label: 'TikTok (usuario)', field: 'tiktok', placeholder: 'marda.oficial' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="font-body text-xs uppercase tracking-wider text-[#6B6B6B] mb-1 block">
                      {item.label}
                    </label>
                    <input
                      type="text"
                      value={settings[item.field as keyof typeof settings]}
                      onChange={(e) => handleChange(item.field, e.target.value)}
                      className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors rounded"
                      placeholder={item.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5">
              <h2 className="font-display text-lg mb-4">Informacion de la Tienda</h2>
              <div className="space-y-4">
                {[
                  { label: 'Titulo de la pagina', field: 'storeTitle' },
                  { label: 'Direccion', field: 'address' },
                  { label: 'Horarios', field: 'hours' },
                  { label: 'Email', field: 'email' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="font-body text-xs uppercase tracking-wider text-[#6B6B6B] mb-1 block">
                      {item.label}
                    </label>
                    <input
                      type="text"
                      value={settings[item.field as keyof typeof settings]}
                      onChange={(e) => handleChange(item.field, e.target.value)}
                      className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors"
            >
              <Save size={16} />
              Guardar cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
