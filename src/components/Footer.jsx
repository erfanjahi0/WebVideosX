import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer({ settings }) {
  return (
    <footer className="mt-14 border-t border-white/10 px-4 py-8 text-sm text-zinc-500">
      <div className="mx-auto max-w-7xl">
        <div className="premium-card rounded-[2rem] p-5 sm:p-6">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 font-black text-white shadow-glow">
                {settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : settings.brand.shortName}
              </div>
              <div>
                <p className="font-black text-white">{settings.brand.name}</p>
                <p className="mt-1">{settings.brand.domainHint}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/legal" className="soft-button px-4 py-2.5">
                <ShieldCheck size={16} /> Legal
              </Link>
              <a href={`mailto:${settings.brand.supportEmail}`} className="soft-button px-4 py-2.5">
                <Mail size={16} /> Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
