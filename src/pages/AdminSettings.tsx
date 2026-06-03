import { useEffect, useState } from 'react';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Globe,
  Search,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Toaster, toast } from 'sonner';
import { useSettings, changeAdminPassword, type StoreSettings } from '@/lib/hooks/useSettings';
import { ApiError } from '@/lib/api';

type TabKey = 'general' | 'contact' | 'social' | 'seo' | 'security';

const tabs: { key: TabKey; label: string; icon: typeof Store }[] = [
  { key: 'general', label: 'General', icon: Store },
  { key: 'contact', label: 'Contacto', icon: Phone },
  { key: 'social', label: 'Redes Sociales', icon: Globe },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'security', label: 'Seguridad', icon: Lock },
];

export default function AdminSettings() {
  const { settings: remoteSettings, loading, error, saveSettings, refetch } = useSettings();
  const [draft, setDraft] = useState<StoreSettings>(remoteSettings);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) setDraft(remoteSettings);
  }, [remoteSettings, loading]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(remoteSettings);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const updateField = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setDraft((s) => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await saveSettings(draft);
      toast.success('Configuracion guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraft(remoteSettings);
    toast.message('Cambios descartados');
  };

  const renderGeneral = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Nombre de la tienda</label>
        <input
          type="text"
          value={draft.storeName}
          onChange={(e) => updateField('storeName', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Tagline / Eslogan</label>
        <input
          type="text"
          value={draft.tagline}
          onChange={(e) => updateField('tagline', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">WhatsApp principal</label>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            inputMode="numeric"
            value={draft.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value.replace(/\D/g, ''))}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="5491139199537"
          />
        </div>
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">Con codigo de pais, sin +</p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">WhatsApp secundario (opcional)</label>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            inputMode="numeric"
            value={draft.whatsappSecondary ?? ''}
            onChange={(e) => updateField('whatsappSecondary', e.target.value.replace(/\D/g, ''))}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="5491178204224"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Email de contacto</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="email"
            value={draft.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="info@marda.com.ar"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Direccion fisica</label>
        <div className="relative">
          <MapPin size={16} className="absolute left-4 top-3 text-[#6B6B6B]" />
          <textarea
            value={draft.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full h-[80px] pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
            placeholder="Direccion de la tienda fisica..."
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Horarios de atencion</label>
        <div className="relative">
          <Clock size={16} className="absolute left-4 top-3 text-[#6B6B6B]" />
          <textarea
            value={draft.hours}
            onChange={(e) => updateField('hours', e.target.value)}
            className="w-full h-[80px] pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
            placeholder="Lunes a Viernes 9:00 - 18:00..."
          />
        </div>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Instagram</label>
        <div className="relative">
          <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={draft.instagram}
            onChange={(e) => updateField('instagram', e.target.value.replace(/^@/, ''))}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="marda.oficial"
          />
        </div>
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">Solo el usuario, sin @</p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Facebook</label>
        <div className="relative">
          <Facebook size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={draft.facebook}
            onChange={(e) => updateField('facebook', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="mardaoficial"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">TikTok</label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.36 6.36 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.2 8.2 0 0 0 4.83 1.56V6.91a4.85 4.85 0 0 1-1.07-.22z" />
          </svg>
          <input
            type="text"
            value={draft.tiktok}
            onChange={(e) => updateField('tiktok', e.target.value.replace(/^@/, ''))}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="marda.oficial"
          />
        </div>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Meta Titulo</label>
        <input
          type="text"
          value={draft.metaTitle}
          onChange={(e) => updateField('metaTitle', e.target.value)}
          maxLength={160}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
          placeholder="MARDA - Ropa Interior y Juvenil"
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">{draft.metaTitle.length}/160 caracteres</p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Meta Descripcion</label>
        <textarea
          value={draft.metaDescription}
          onChange={(e) => updateField('metaDescription', e.target.value)}
          maxLength={320}
          className="w-full h-[100px] px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
          placeholder="Descripcion para buscadores..."
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">{draft.metaDescription.length}/320 caracteres</p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Keywords</label>
        <input
          type="text"
          value={draft.keywords}
          onChange={(e) => updateField('keywords', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
          placeholder="ropa interior, lenceria, ropa juvenil..."
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">Separadas por comas</p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Google Analytics ID</label>
        <input
          type="text"
          value={draft.googleAnalyticsId}
          onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
          placeholder="G-XXXXXXXXXX"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneral();
      case 'contact':
        return renderContact();
      case 'social':
        return renderSocial();
      case 'seo':
        return renderSEO();
      case 'security':
        return <ChangePasswordForm />;
    }
  };

  const showSaveBar = activeTab !== 'security';

  return (
    <AdminLayout title="Configuracion">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF' },
        }}
      />

      {error && (
        <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-body text-sm flex items-center justify-between gap-3">
          <span>Error al cargar configuracion: {error}</span>
          <button onClick={refetch} className="underline whitespace-nowrap">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[240px] flex-shrink-0">
          <div className="flex lg:flex-col gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'bg-[#6F1219]/15 text-white' : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} className="flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="font-display text-lg text-white mb-6">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>

            <div className="animate-fade-in">
              {loading && activeTab !== 'security' ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-2 border-[#6F1219] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                renderContent()
              )}
            </div>

            {showSaveBar && (
              <div className="mt-8 pt-5 border-t border-[#2A2A2A] flex justify-end items-center gap-3">
                {dirty && (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="px-5 py-3 font-body text-sm text-[#A1A1A1] hover:text-white border border-[#2A2A2A] rounded-lg transition-colors"
                  >
                    Descartar
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!dirty || saving || loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : dirty ? 'Guardar Cambios' : 'Sin cambios'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) {
      setError('La nueva contrasena debe tener al menos 8 caracteres');
      return;
    }
    if (next !== confirm) {
      setError('Las contrasenas no coinciden');
      return;
    }
    if (current === next) {
      setError('La nueva contrasena debe ser diferente a la actual');
      return;
    }
    setSubmitting(true);
    try {
      await changeAdminPassword({
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success('Contrasena actualizada. Vuelve a iniciar sesion proximamente.');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === 'invalid_current_password') setError('Contrasena actual incorrecta');
        else if (err.message === 'new_password_must_differ') setError('La nueva contrasena debe ser diferente');
        else if (err.message === 'passwords_do_not_match') setError('Las contrasenas no coinciden');
        else setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-[480px]">
      <p className="font-body text-[13px] text-[#A1A1A1]">
        Cambia tu contrasena de administrador. Minimo 8 caracteres.
      </p>

      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Contrasena actual</label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>

      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Nueva contrasena</label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>

      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">Confirmar nueva contrasena</label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
          className="w-4 h-4 accent-[#6F1219]"
        />
        <span className="font-body text-[13px] text-[#A1A1A1] flex items-center gap-1">
          {showPasswords ? <Eye size={14} /> : <EyeOff size={14} />}
          Mostrar contrasenas
        </span>
      </label>

      {error && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-[#EF4444] font-body text-[13px]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-3 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock size={16} />
        {submitting ? 'Cambiando...' : 'Cambiar contrasena'}
      </button>
    </form>
  );
}
