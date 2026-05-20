import { useEffect, useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';

export default function AgeGate({ enabled = true, minimumAge = 18, storageKey = 'age_verified_v1' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    try {
      setVisible(localStorage.getItem(storageKey) !== 'true');
    } catch {
      setVisible(true);
    }
  }, [enabled, storageKey]);

  if (!enabled || !visible) return null;

  const enterSite = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore storage failures and still allow entry after click.
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.22),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.16),transparent_28%)]" />
      <div className="premium-card fade-in-up relative w-full max-w-md rounded-[2.25rem] p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/25 shadow-glow">
          <ShieldCheck size={34} />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.35em] text-rose-200">Age confirmation</p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Adults only</h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          This website is intended only for visitors who are {minimumAge}+ years old. By entering,
          you confirm that you meet the legal age requirement in your location.
        </p>

        <button
          onClick={enterSite}
          className="premium-button mt-7 w-full"
        >
          I am {minimumAge}+ — Enter
        </button>

        <button
          onClick={() => {
            window.location.href = 'https://www.google.com';
          }}
          className="soft-button mt-3 w-full"
        >
          <XCircle size={18} /> Leave site
        </button>
      </div>
    </div>
  );
}
