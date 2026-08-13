"use client";

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

const FacebookIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function SocialFloat() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || 
      pathname?.startsWith('/system') || 
      pathname?.startsWith('/wall/') || 
      pathname?.startsWith('/mobile/') ||
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/create')
  ) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:left-6 sm:right-auto z-50 flex items-center gap-3">
      <a 
        href="https://www.facebook.com/1270689629459999" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 hover:brightness-110 transition-all shadow-[0_4px_14px_0_rgba(24,119,242,0.39)]"
      >
        <FacebookIcon />
      </a>
      <a 
        href="https://www.instagram.com/my_memento_app" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white hover:scale-110 hover:brightness-110 transition-all shadow-[0_4px_14px_0_rgba(220,39,67,0.39)]"
      >
        <InstagramIcon />
      </a>
      <a 
        href="https://api.whatsapp.com/send?phone=919866161775" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 hover:brightness-110 transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"
      >
        <MessageCircle size={22} fill="white" className="text-white" />
      </a>
    </div>
  );
}
