import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  whatsappSecondary?: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  googleAnalyticsId: string;
}

interface SettingsResponse {
  settings: StoreSettings;
}

const FALLBACK: StoreSettings = {
  storeName: 'MARDA',
  tagline: 'Ropa que te define',
  whatsapp: '5491139199537',
  whatsappSecondary: '5491178204224',
  email: 'info@marda.com.ar',
  address: 'Buenos Aires, Argentina',
  hours: 'Lunes a Viernes 9:00 - 18:00, Sabados 10:00 - 14:00',
  instagram: 'marda.oficial',
  facebook: 'mardaoficial',
  tiktok: 'marda.oficial',
  metaTitle: 'MARDA - Ropa Interior y Juvenil Argentina',
  metaDescription:
    'MARDA: ropa interior y ropa juvenil para hombres y mujeres. Envios a todo el pais.',
  keywords: 'ropa interior, lenceria, ropa juvenil, MARDA',
  googleAnalyticsId: '',
};

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<SettingsResponse>('/api/settings');
      setSettings({ ...FALLBACK, ...data.settings });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (patch: Partial<StoreSettings>) => {
    const data = await api.patch<SettingsResponse>('/api/settings', patch, { auth: true });
    setSettings({ ...FALLBACK, ...data.settings });
    return data.settings;
  }, []);

  return { settings, loading, error, saveSettings, refetch: fetchSettings };
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await api.post('/api/auth/change-password', input, { auth: true });
}
