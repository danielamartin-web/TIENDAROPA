import { useState, useEffect, useRef } from 'react';
import { WHATSAPP_MARTIN, WHATSAPP_DANIELA } from '@/lib/constants';
import { MessageCircle, X, User } from 'lucide-react';

interface WhatsAppContact {
  name: string;
  number: string;
  label: string;
}

const CONTACTS: WhatsAppContact[] = [
  { name: 'Martin', number: WHATSAPP_MARTIN, label: 'Escribir a Martin' },
  { name: 'Daniela', number: WHATSAPP_DANIELA, label: 'Escribir a Daniela' },
];

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleContactClick = (number: string) => {
    const message = 'Hola MARDA! Quiero hacer una consulta.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {/* Contact Menu */}
      {open && (
        <div className="flex flex-col gap-2 mb-1 animate-fade-in-up">
          {CONTACTS.map((contact) => (
            <button
              key={contact.number}
              onClick={() => handleContactClick(contact.number)}
              className="flex items-center gap-3 bg-[#1A1A1A] text-white pl-4 pr-5 py-3 rounded-full shadow-lg border border-[#2A2A2A] hover:border-[#25D366] hover:bg-[#222] transition-all duration-200 min-w-[200px]"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-[#25D366]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-body font-medium text-white">{contact.label}</p>
                <p className="text-[10px] font-body text-[#6B6B6B]">
                  +{contact.number.replace(/(\d{2})(\d{1})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4-$5')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main WhatsApp Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-whatsapp transition-all duration-300"
        style={{
          background: open ? '#1A1A1A' : '#25D366',
          border: open ? '2px solid #25D366' : '2px solid transparent',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          boxShadow: hovered
            ? '0 6px 24px rgba(37,211,102,0.5)'
            : '0 4px 16px rgba(37,211,102,0.4)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={open ? 'Cerrar menu WhatsApp' : 'Contactar por WhatsApp'}
      >
        {open ? (
          <X size={24} className="text-[#25D366]" />
        ) : (
          <MessageCircle size={28} className="text-white" fill="white" />
        )}
      </button>

      {/* Mini Label */}
      {!open && (
        <span className="absolute -top-8 right-0 bg-[#1A1A1A] text-white text-[10px] font-body px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Escribinos
        </span>
      )}
    </div>
  );
}
