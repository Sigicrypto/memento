"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const socials = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/1270689629459999',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/my_memento_app',
    color: '#E1306C',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.979C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
];

export default function SocialFloat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || 
      pathname?.startsWith('/system') || 
      pathname?.startsWith('/wall/') || 
      pathname?.startsWith('/mobile/') ||
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/create')
  ) return null;

  return (
    <div
      className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Social buttons — slide up when open */}
      <div className="flex flex-col items-end gap-3">
        {socials.map((s, i) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
            className="flex items-center gap-2 transition-all duration-300"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0) scale(1)' : `translateY(${(socials.length - i) * 12}px) scale(0.8)`,
              transitionDelay: open ? `${i * 60}ms` : `${(socials.length - 1 - i) * 40}ms`,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {/* Label */}
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{
                background: '#1e2235',
                color: '#e2e8f0',
                boxShadow: '4px 4px 8px #14182a, -2px -2px 6px #252c46',
              }}
            >
              {s.name}
            </span>
            {/* Icon button */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{
                background: '#1e2235',
                color: s.color,
                boxShadow: `4px 4px 10px #14182a, -3px -3px 8px #252c46, 0 0 0 1px ${s.color}22`,
              }}
            >
              {s.icon}
            </div>
          </a>
        ))}
      </div>

      {/* Trigger button */}
      <div
        className="w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
        style={{
          width: '52px',
          height: '52px',
          background: open
            ? 'linear-gradient(135deg, #f59e0b, #f472b6)'
            : '#1e2235',
          color: open ? '#1e2235' : '#f59e0b',
          animation: 'social-bounce 3s ease-in-out infinite 0.5s',
          boxShadow: open
            ? '0 4px 20px rgba(245,158,11,0.4)'
            : '5px 5px 12px #14182a, -4px -4px 10px #252c46',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
      </div>
    </div>
  );
}
