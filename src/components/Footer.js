import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Mail, MapPin } from 'lucide-react'
import { SITE, NAV_LINKS } from '../data/siteData'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-display text-lg leading-none">S</span>
              </div>
              <span className="font-heading font-bold text-white text-xl">
                Shift<span className="text-orange-400">Buddy</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm font-body leading-relaxed mb-5">
              Built for the Patch.<br />Built for Your Life.
            </p>
            <div className="flex items-center gap-1 text-white/40 text-xs font-body mb-6">
              <MapPin size={12} />
              <span>Fort McMurray, Alberta, Canada</span>
            </div>
            <div className="flex items-center gap-3">
              <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 flex items-center justify-center transition-all">
                <Facebook size={16} />
              </a>
              <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 flex items-center justify-center transition-all">
                <Instagram size={16} />
              </a>
              <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 flex items-center justify-center transition-all">
                <Linkedin size={16} />
              </a>
              <a href={`mailto:${SITE.email}`}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 flex items-center justify-center transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-widest mb-5">Navigation</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-orange-400 text-sm font-body transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-widest mb-5">App Features</h4>
            <ul className="space-y-3">
              {['Shift Hub', 'Family Sync', 'Money Manager', 'Wellbeing', 'Fort Mac Life', 'Crew Network', 'Coming Home Mode', 'Shift Swap'].map(f => (
                <li key={f}>
                  <Link href="/features" className="text-white/50 hover:text-orange-400 text-sm font-body transition-colors">
                    {f}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-widest mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'For Employers', href: '/employers' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
                { label: 'Download App', href: '/download' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/50 hover:text-orange-400 text-sm font-body transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs font-body">
            © {year} ShiftBuddys. All rights reserved. Made with ❤️ in Fort McMurray, Alberta.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-white/30 hover:text-white/60 text-xs font-body transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/30 hover:text-white/60 text-xs font-body transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
