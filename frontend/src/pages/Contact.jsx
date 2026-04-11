import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, ChevronDown, Sparkles, Heart, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = 'service_4kk64yo';
const EMAILJS_TEMPLATE_ID = 'template_q34asye';
const EMAILJS_PUBLIC_KEY  = 'bnRbVfCMdm8LkiItx';

const FAQS = [
  { q: 'Do you offer custom sizing?', a: 'Yes! We offer custom stitching on most ethnic and bridal pieces. Contact us on WhatsApp for a custom quote.' },
  { q: 'How can I purchase a product I like?', a: 'Browse here, then contact us directly to purchase.' },
  { q: 'Is online checkout available?', a: 'No. Purchases are completed through direct contact only.' },
];

export default function Contact() {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          phone:      form.phone || 'Not provided',
          message:    form.message,
          reply_to:   form.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      toast.success("Message sent! We'll reply soon 💌");
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      toast.error('Something went wrong. Please try WhatsApp or call us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 pb-6 min-h-screen">

      <div className="px-4 max-w-lg mx-auto space-y-6">
        <div className="bg-white border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blush via-rose to-mink" />
          <div className="p-5 space-y-4">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blush flex-shrink-0">
                <img src="/images/me.jpg" className="w-full h-full object-cover object-top" alt="Palak Khandelwal" />
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-widest uppercase text-mink mb-0.5">Founder & Curator</p>
                <p className="font-display text-xl italic text-charcoal">Palak Khandelwal</p>
              </div>
            </div>

            <p className="font-sans text-xs text-mink leading-relaxed">
              Glamour Boutique was born from my deep love for Indian craftsmanship and timeless style. What began as a personal passion for helping women feel confident and beautiful in what they wear has evolved into a thoughtfully curated space where heritage meets modern elegance.
            </p>
            <p className="font-sans text-xs text-mink leading-relaxed">
              Every piece in our collection is handpicked by me, from the silk weavers of Varanasi to the block printers of Jaipur. I ensure that each garment is not just beautiful, but carries a story that deserves to be worn and celebrated.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="text-center p-3 bg-champagne/30">
                <Sparkles size={16} className="mx-auto mb-1.5 text-rose" />
                <p className="font-display text-xs italic text-charcoal">Curated</p>
                <p className="font-sans text-[9px] text-mink mt-0.5">Handpicked pieces</p>
              </div>
              <div className="text-center p-3 bg-champagne/30">
                <Heart size={16} className="mx-auto mb-1.5 text-rose" />
                <p className="font-display text-xs italic text-charcoal">Crafted</p>
                <p className="font-sans text-[9px] text-mink mt-0.5">With love & care</p>
              </div>
              <div className="text-center p-3 bg-champagne/30">
                <Award size={16} className="mx-auto mb-1.5 text-rose" />
                <p className="font-display text-xs italic text-charcoal">Quality</p>
                <p className="font-sans text-[9px] text-mink mt-0.5">Premium fabrics</p>
              </div>
            </div>

            <blockquote className="border-l-2 border-rose pl-4 py-1">
              <p className="font-display text-sm italic text-charcoal leading-snug">
                "Fashion is not just clothing — it is the story you choose to tell the world."
              </p>
              <p className="font-sans text-[10px] text-mink mt-1">— Palak Khandelwal</p>
            </blockquote>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-champagne/30 mt-6 px-4 pt-4 pb-2 w-full text-center">
          <p className="tag mb-1">We'd love to hear from you</p>
          <h1 className="font-display text-2xl text-charcoal">Contact Us</h1>
        </div>
      </div>

      <div className="bg-champagne/40">
        <div className="px-4 py-7 max-w-lg mx-auto space-y-6">

          {/* WhatsApp CTA */}
          <a href="https://wa.me/919977803404?text=Hello! I'd like to enquire about your collections."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#25D366] text-white p-4 active:scale-[0.98] transition-transform shadow-md">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="font-sans font-medium text-sm">Chat on WhatsApp</p>
              <p className="font-sans text-xs text-white/80">Get instant replies — we're online!</p>
            </div>
          </a>

          {/* Quick contact cards */}
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:+919977803404"
              className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 text-center active:bg-champagne/40 transition-colors">
              <div className="w-10 h-10 bg-rose/10 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-rose" />
              </div>
              <p className="font-sans font-medium text-xs text-charcoal">Call Us</p>
              <p className="font-sans text-[11px] text-mink">+91 99778 03404</p>
            </a>
            <a href="mailto:glamourboutique013@gmail.com"
              className="flex flex-col items-center gap-2 bg-white border border-gray-100 p-4 text-center active:bg-champagne/40 transition-colors">
              <div className="w-10 h-10 bg-rose/10 rounded-full flex items-center justify-center">
                <Mail size={18} className="text-rose" />
              </div>
              <p className="font-sans font-medium text-xs text-charcoal">Email</p>
              <p className="font-sans text-[11px] text-mink truncate w-full text-center">glamourboutique013@gmail.com</p>
            </a>
          </div>

          {/* Store info */}
          <div className="bg-white border border-gray-100 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-champagne flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-rose" />
              </div>
              <div>
                <p className="font-sans text-xs font-medium text-charcoal mb-0.5">Address</p>
                <p className="font-sans text-xs text-mink leading-relaxed">99, opposite sidheswar mahadev mandir, Schme no. 14-4, Vikas Nagar, Neemuch, Madhya Pradesh 458441</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-champagne flex items-center justify-center flex-shrink-0">
                <Clock size={15} className="text-rose" />
              </div>
              <div>
                <p className="font-sans text-xs font-medium text-charcoal mb-0.5">Store Hours</p>
                <p className="font-sans text-xs text-mink">Mon–Sat: 10am – 8pm</p>
                <p className="font-sans text-xs text-mink">Sunday: 11am – 6pm</p>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="overflow-hidden border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.436935418978!2d74.87174329999999!3d24.470313299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39667300529b7527%3A0x34f2b1cd4b7e8b58!2sGlamour%20Boutique!5e0!3m2!1sen!2sin!4v1774271768921!5m2!1sen!2sin"
              width="100%" height="220"
              style={{ border: 0, display: 'block', filter: 'grayscale(15%)' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Glamour Boutique Location"
            />
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-display text-xl text-charcoal mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-3">

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink mb-1.5">Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" placeholder="Your name"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink mb-1.5">Phone</label>
                <input
                  type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-field" placeholder="+91 XXXXX"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink mb-1.5">Email *</label>
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field" placeholder="your@email.com"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink mb-1.5">Message *</label>
                <textarea
                  required rows={4} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="What are you looking for?"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <button
                type="submit" disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-xl text-charcoal mb-4">Quick Answers</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gray-100 bg-white">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                    <span className="font-sans text-sm text-charcoal font-medium">{faq.q}</span>
                    <ChevronDown size={14} className={`text-mink flex-shrink-0 ml-2 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen === i && (
                    <div className="px-4 pb-4 text-xs font-sans text-mink leading-relaxed">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="flex justify-center gap-4 pb-4">
            <a href="https://www.instagram.com/glamourboutiquenmh?igsh=MTg2bmp5MHphZjN1MQ==" className="flex items-center gap-2 border border-gray-200 px-5 py-3 text-xs font-sans text-charcoal">
              <Instagram size={15} /> Instagram
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
