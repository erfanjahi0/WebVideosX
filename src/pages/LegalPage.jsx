import { Mail, Scale, ShieldCheck } from 'lucide-react';

export default function LegalPage({ settings }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="premium-card rounded-[2.25rem] p-6 md:p-10">
        <div className="relative">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/20">
            <Scale size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-200">Legal</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Terms, Privacy, and Removal Requests</h1>

          <div className="mt-8 grid gap-4 text-sm leading-7 text-zinc-400">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-2 inline-flex items-center gap-2 text-xl font-black text-white"><ShieldCheck size={21} className="text-rose-200" /> Age restriction</h2>
              <p>
                This website is intended only for adults who are at least {settings.legal.minimumAge}+ years old and legally allowed to access this type of content in their location.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-2 text-xl font-black text-white">Embedded videos</h2>
              <p>
                Videos may be embedded from third-party platforms. The website owner should only embed content they are allowed to share and should follow the rules of the hosting platform.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-2 inline-flex items-center gap-2 text-xl font-black text-white"><Mail size={21} className="text-rose-200" /> DMCA / removal</h2>
              <p>
                For copyright or content removal requests, contact: <a className="font-bold text-rose-200 hover:text-white" href={`mailto:${settings.brand.supportEmail}`}>{settings.brand.supportEmail}</a>.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-2 text-xl font-black text-white">Advertising</h2>
              <p>
                This website may show third-party advertisements, popunder ads, native ads, or direct-link buttons. External links are controlled by their own terms and privacy policies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
