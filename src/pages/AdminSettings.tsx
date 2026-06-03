import { useState, useEffect } from 'react';
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
  Upload,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Toaster, toast } from 'sonner';

interface AppSettings {
  storeName: string;
  tagline: string;
  logo: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsappNumber: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  googleAnalyticsId: string;
}

const defaultSettings: AppSettings = {
  storeName: 'MARDA',
  tagline: 'Ropa que te define',
  logo: '',
  whatsapp: '5491139199537',
  email: 'contacto@marda.com',
  address: 'Buenos Aires, Argentina',
  hours: 'Lunes a Viernes 9:00 - 18:00, Sabados 10:00 - 14:00',
  instagram: 'Marda.0ficial',
  facebook: 'mardaoficial',
  tiktok: 'marda.oficial',
  whatsappNumber: '5491139199537',
  metaTitle: 'MARDA - Ropa Interior y Juvenil',
  metaDescription:
    'MARDA - Tienda online de ropa interior y ropa juvenil para hombres y mujeres. Envios a todo el pais. Compra facil por WhatsApp.',
  keywords: 'ropa interior, lenceria, ropa juvenil, moda masculina, moda femenina',
  googleAnalyticsId: '',
};

const STORAGE_KEY = 'marda_settings';

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return { ...defaultSettings };
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

type TabKey = 'general' | 'contact' | 'social' | 'seo';

const tabs: { key: TabKey; label: string; icon: typeof Store }[] = [
  { key: 'general', label: 'General', icon: Store },
  { key: 'contact', label: 'Contacto', icon: Phone },
  { key: 'social', label: 'Redes Sociales', icon: Globe },
  { key: 'seo', label: 'SEO', icon: Search },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    toast.success('Configuracion guardada');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateField('logo', url);
      toast.success('Logo subido');
    }
  };

  const renderGeneral = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Nombre de la tienda
        </label>
        <input
          type="text"
          value={settings.storeName}
          onChange={(e) => updateField('storeName', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Tagline / Eslogan
        </label>
        <input
          type="text"
          value={settings.tagline}
          onChange={(e) => updateField('tagline', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
        />
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] flex items-center justify-center overflow-hidden">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="font-display text-[20px] text-[#6B6B6B]">
                {settings.storeName.charAt(0)}
              </span>
            )}
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#0F0F0F] border border-[#2A2A2A] text-white font-body text-sm rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer">
            <Upload size={16} />
            Subir logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Numero de WhatsApp
        </label>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={settings.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="5491139199537"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Email de contacto
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="email"
            value={settings.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="contacto@marda.com"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Direccion fisica
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-4 top-3 text-[#6B6B6B]"
          />
          <textarea
            value={settings.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full h-[80px] pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
            placeholder="Direccion de la tienda fisica..."
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Horarios de atencion
        </label>
        <div className="relative">
          <Clock
            size={16}
            className="absolute left-4 top-3 text-[#6B6B6B]"
          />
          <textarea
            value={settings.hours}
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
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Instagram
        </label>
        <div className="relative">
          <Instagram
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={settings.instagram}
            onChange={(e) => updateField('instagram', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="Marda.0ficial"
          />
        </div>
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
          Solo el usuario, sin @
        </p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Facebook
        </label>
        <div className="relative">
          <Facebook
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={settings.facebook}
            onChange={(e) => updateField('facebook', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="mardaoficial"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          TikTok
        </label>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.36 6.36 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.2 8.2 0 0 0 4.83 1.56V6.91a4.85 4.85 0 0 1-1.07-.22z" />
          </svg>
          <input
            type="text"
            value={settings.tiktok}
            onChange={(e) => updateField('tiktok', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="marda.oficial"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Numero de WhatsApp
        </label>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            value={settings.whatsappNumber}
            onChange={(e) => updateField('whatsappNumber', e.target.value)}
            className="w-full h-[44px] pl-10 pr-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
            placeholder="5491139199537"
          />
        </div>
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
          Con codigo de pais, sin +
        </p>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Meta Titulo
        </label>
        <input
          type="text"
          value={settings.metaTitle}
          onChange={(e) => updateField('metaTitle', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
          placeholder="MARDA - Ropa Interior y Juvenil"
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
          Maximo 60 caracteres recomendado
        </p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Meta Descripcion
        </label>
        <textarea
          value={settings.metaDescription}
          onChange={(e) => updateField('metaDescription', e.target.value)}
          className="w-full h-[100px] px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors resize-none"
          placeholder="Descripcion para buscadores..."
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
          Maximo 160 caracteres recomendado
        </p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Keywords
        </label>
        <input
          type="text"
          value={settings.keywords}
          onChange={(e) => updateField('keywords', e.target.value)}
          className="w-full h-[44px] px-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white font-body text-sm focus:outline-none focus:border-[#6F1219] transition-colors"
          placeholder="ropa interior, lenceria, ropa juvenil..."
        />
        <p className="font-body text-[11px] text-[#6B6B6B] mt-1">
          Separadas por comas
        </p>
      </div>
      <div>
        <label className="font-body text-[13px] text-[#A1A1A1] mb-2 block">
          Google Analytics ID
        </label>
        <input
          type="text"
          value={settings.googleAnalyticsId}
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
    }
  };

  return (
    <AdminLayout title="Configuracion">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#FFFFFF' },
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-[240px] flex-shrink-0">
          <div className="flex lg:flex-col gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#6F1219]/15 text-white'
                    : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={18} className="flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
            <h2 className="font-display text-lg text-white mb-6">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>

            <div className="animate-fade-in">{renderContent()}</div>

            {/* Save Button */}
            <div className="mt-8 pt-5 border-t border-[#2A2A2A] flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-[#6F1219] text-white font-body text-sm font-medium rounded-lg hover:bg-[#5A0E14] transition-colors"
              >
                <Save size={16} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
