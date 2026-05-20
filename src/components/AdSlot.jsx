import { useEffect } from 'react';
import { BadgeDollarSign } from 'lucide-react';

function injectScript(src, id) {
  if (!src || document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}

export function GlobalAdScripts({ settings }) {
  const ads = settings?.ads;

  useEffect(() => {
    if (!ads?.enabled) return;
    injectScript(ads.popunderScriptUrl, 'global-popunder-script');
    injectScript(ads.socialBarScriptUrl, 'global-socialbar-script');
  }, [ads?.enabled, ads?.popunderScriptUrl, ads?.socialBarScriptUrl]);

  return null;
}

export default function AdSlot({ html, label = 'Advertisement', compact = false, enabled = true }) {
  if (!enabled) return null;

  if (!html) {
    return (
      <div
        className={`premium-card flex items-center justify-center rounded-[1.75rem] border-dashed text-center text-sm text-zinc-500 ${
          compact ? 'min-h-24 p-4' : 'min-h-28 p-6'
        }`}
      >
        <div className="relative">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-400 ring-1 ring-white/10">
            <BadgeDollarSign size={20} />
          </div>
          <p className="font-black text-zinc-300">{label}</p>
          <p className="mt-1 text-xs text-zinc-600">Ad slot ready</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`premium-card overflow-hidden rounded-[1.75rem] ${compact ? 'p-3' : 'p-4'}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
