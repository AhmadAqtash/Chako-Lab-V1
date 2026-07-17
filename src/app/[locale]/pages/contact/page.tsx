import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import { SOCIALS } from '@/lib/socials';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'اتصل بنا' : 'Contact Us',
    alternates: localeAlternates(params.locale, '/pages/contact'),
  };
}

export default function ContactPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Get In Touch</p>
      <h1 className="text-heading font-display font-bold mb-4">Contact Us</h1>
      <p className="text-chako-ink/60 text-sm leading-relaxed mb-10 max-w-md">
        We&apos;re here to help. Reach us via email or WhatsApp and we&apos;ll get back to you within one business day.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Email', value: 'hello@chakolab.ae', href: 'mailto:hello@chakolab.ae' },
          { label: 'WhatsApp', value: '+971 56 688 1332', href: 'https://wa.me/971566881332' },
          { label: 'Instagram', value: '@chakolab.ae', href: SOCIALS.instagram },
          { label: 'TikTok', value: '@chakolabae', href: SOCIALS.tiktok },
          { label: 'Based in', value: 'Dubai, UAE', href: null },
        ].map(({ label, value, href }) => (
          <div key={label} className="bg-chako-accent rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-chako-ink/40 uppercase tracking-widest mb-1">{label}</p>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline">
                {value}
              </a>
            ) : (
              <p className="text-sm font-semibold">{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
