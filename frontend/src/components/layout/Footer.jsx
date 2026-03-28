import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      {/* Promotional Banner */}
    

      {/* Main grid */}
      <div className="px-4 py-6 md:max-w-6xl md:mx-auto md:grid md:grid-cols-4 md:gap-8 md:py-10">

        {/* Brand */}
        <div className="pb-5 border-b border-white/10 md:border-0 md:pb-0">
          <div className="mb-3">
            <span className="font-display text-3xl italic text-ivory">Glamour</span>
            <span className="block font-sans text-[11px] tracking-[0.4em] text-rose uppercase">Boutique</span>
          </div>
          <p className="text-sm text-white/55 font-sans leading-relaxed mb-4">
            Curating timeless fashion for the 
            <br/>
            modern woman.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/glamourboutiquenmh?igsh=MTg2bmp5MHphZjN1MQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Glamour Boutique on Instagram"
              title="Glamour Boutique"
              className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-rose hover:text-rose transition-colors"
            >
              <Instagram size={13} />
            </a>
          </div>
        </div>

        {/* Collections & Quick Links — accordion on mobile */}
        {[
          {
            key: 'collections', label: 'Collections',
            links: ['Ethnic','Western','Bridal','Casual',].map(c => ({ to: `/collections/${c.toLowerCase()}`, label: c }))
          },
          {
            key: 'links', label: 'Quick Links',
            links: [
              { to: '/',            label: 'Home'       },
              { to: '/collections', label: 'Shop All'   },
              { to: '/favourites',  label: 'Favourites' },
              { to: '/contact',     label: 'Contact'    },
            ]
          },
        ].map(section => (
          <AccordionSection key={section.key} section={section} />
        ))}

        {/* Contact */}
        <div className="pt-4 md:pt-0">
          <p className="tag text-blush text-[12px] tracking-[0.25em] mb-3">Find Us</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-xs text-white/60 font-sans">
              <MapPin size={12} className="mt-0.5 text-rose flex-shrink-0" />
              <span>99, opposite sidheswar mahadev mandir, Schme no. 14-4, Vikas Nagar, Neemuch, Madhya Pradesh 458441</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60 font-sans">
              <Phone size={12} className="text-rose" />
              <a href="tel:+919977803404" className="hover:text-ivory">+91 99778 03404</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60 font-sans">
              <Mail size={12} className="text-rose" />
              <a href="mailto:glamourboutique01@gmail.com" className="hover:text-ivory truncate">glamourboutique01@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/35 font-sans flex items-center gap-1.5">
            Created by{' '}
            <a
              href="www.linkedin.com/in/nikunj-garg-35aa752a7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blush hover:text-rose transition-colors flex items-center gap-1 font-medium"
            >
              <Linkedin size={11} />
              Nikunj Garg
            </a>
          </p>
          <p className="text-[10px] text-white/35 font-sans pr-[35px] tracking-widest text-center sm:text-left">
            © 2026 GLAMOUR BOUTIQUE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Accordion for mobile collections/links
function AccordionSection({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-4 md:py-0 md:cursor-default"
      >
        <p className="tag text-blush text-[9px] tracking-[0.25em]">{section.label}</p>
        <span className={`text-white/50 md:hidden transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'} md:max-h-none  md:pb-0`}>
        {section.links.map(l => (
          <Link key={l.to} to={l.to} className="block text-xs text-white/60 font-sans py-1.5 hover:text-ivory transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}