import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Image,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  Mail,
  Megaphone,
  Pencil,
  PlaySquare,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { auth, db, hasFirebaseConfig } from '../firebase';
import { siteConfig } from '../config/siteConfig';
import { normalizeVideo, serializeSettings, sortNewestFirst, stringToTags, tagsToString } from '../utils/format';

const emptyVideo = {
  title: '',
  thumbnail: '',
  views: '',
  duration: '',
  category: 'Latest',
  tags: '',
  embedUrl: '',
  directLink: '',
  status: 'active'
};

function adminSegment(pathname, adminPath) {
  const rest = pathname.slice(adminPath.length).replace(/^\/+/, '');
  return rest.split('/')[0] || 'dashboard';
}

function AdminButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function Toast({ notice, onClose }) {
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [notice, onClose]);

  if (!notice) return null;

  const Icon = notice.type === 'error' ? AlertTriangle : CheckCircle2;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] sm:left-auto sm:w-[380px]">
      <div className={`premium-card fade-in-up rounded-3xl p-4 ${notice.type === 'error' ? 'border-red-300/20' : 'border-emerald-300/20'}`}>
        <div className="relative flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${notice.type === 'error' ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-white">{notice.title}</p>
            {notice.message && <p className="mt-1 text-sm leading-5 text-zinc-400">{notice.message}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white" aria-label="Close notification">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmText = 'Confirm', danger = false, busy = false, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl">
      <div className="premium-card fade-in-up w-full max-w-md rounded-[2rem] p-6">
        <div className="relative">
          <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl ${danger ? 'bg-red-500/15 text-red-200' : 'bg-rose-500/15 text-rose-200'} ring-1 ring-white/10`}>
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <AdminButton onClick={onCancel} disabled={busy} className="border border-white/10 bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1]">
              Cancel
            </AdminButton>
            <AdminButton onClick={onConfirm} disabled={busy} className={danger ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-rose-500 text-white hover:bg-rose-400'}>
              {busy && <Loader2 size={17} className="animate-spin" />} {confirmText}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageTitle({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-200">{eyebrow}</p>
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>}
    </div>
  );
}

function ConfigMissing({ adminPath }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="premium-card w-full max-w-3xl rounded-[2.25rem] p-6 shadow-soft sm:p-8">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/20">
            <Shield size={32} />
          </div>
          <h1 className="mt-5 text-3xl font-black">Firebase is not connected yet</h1>
          <p className="mt-3 leading-7 text-zinc-400">
            Create a Firebase project and add the VITE_FIREBASE_* values to your .env file or hosting environment variables.
          </p>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
            Current admin path: <strong className="text-white">{adminPath}</strong>
          </p>
        </div>
      </div>
    </main>
  );
}

function LoginScreen({ adminPath }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(244,63,94,0.22),transparent_34%),linear-gradient(180deg,#09090b,#000)]" />
      <form onSubmit={submit} className="premium-card fade-in-up relative w-full max-w-md rounded-[2.25rem] p-6 shadow-soft sm:p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/20 shadow-glow">
          <Shield size={32} />
        </div>

        <h1 className="mt-5 text-3xl font-black">Admin login</h1>
        <p className="mt-2 text-sm text-zinc-500">Protected admin area at {adminPath}</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="admin-label">Email</label>
            <input className="admin-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>

          <div>
            <label className="admin-label">Password</label>
            <input className="admin-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

        <AdminButton disabled={busy} className="premium-button mt-6 w-full">
          {busy && <Loader2 size={18} className="animate-spin" />} {busy ? 'Logging in...' : 'Login'}
        </AdminButton>
      </form>
    </main>
  );
}

function Sidebar({ page, adminPath, user }) {
  const links = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['videos', 'Videos', PlaySquare],
    ['settings', 'Settings', Settings],
    ['ads', 'Ads', BarChart3]
  ];

  return (
    <aside className="sticky top-0 z-40 border-b border-white/10 bg-black/60 p-3 backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r lg:p-4">
      <div className="premium-card rounded-[1.75rem] p-4 lg:h-full">
        <div className="relative flex items-center justify-between gap-3 lg:block">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-glow">
              <Sparkles size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-white">Admin Panel</p>
              <p className="mt-1 max-w-48 truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <Link to="/" className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-zinc-300 transition hover:bg-white/10 hover:text-white lg:mt-5 lg:inline-flex">
            Open site
          </Link>
        </div>

        <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:grid lg:grid-cols-1 lg:overflow-visible">
          {links.map(([key, label, Icon]) => (
            <Link
              key={key}
              to={key === 'dashboard' ? adminPath : `${adminPath}/${key}`}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                page === key ? 'bg-rose-500 text-white shadow-glow' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 hidden lg:block">
          <AdminButton onClick={() => signOut(auth)} className="w-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white">
            <LogOut size={18} /> Logout
          </AdminButton>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, tone = 'rose' }) {
  const tones = {
    rose: 'bg-rose-500/15 text-rose-200',
    emerald: 'bg-emerald-500/15 text-emerald-200',
    sky: 'bg-sky-500/15 text-sky-200'
  };

  return (
    <div className="admin-card">
      <div className="relative flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]} ring-1 ring-white/10`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="text-sm font-semibold text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ videos, settings, adminPath }) {
  const active = videos.filter((video) => video.status === 'active').length;
  const hidden = videos.length - active;
  const recent = videos.slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="premium-card rounded-[2.25rem] p-6 sm:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageTitle eyebrow="Overview" title="Dashboard" description="Control the public website, videos, branding, safety settings, and monetization from one clean panel." />
          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-zinc-400">
            Admin URL <strong className="text-white">{adminPath}</strong>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <StatCard label="Total videos" value={videos.length} icon={PlaySquare} tone="sky" />
        <StatCard label="Active videos" value={active} icon={Eye} tone="emerald" />
        <StatCard label="Hidden videos" value={hidden} icon={EyeOff} tone="rose" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="admin-card">
          <div className="relative">
            <h2 className="text-xl font-black text-white">Quick status</h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {[
                ['Website name', settings.brand.name],
                ['Age gate', settings.legal.showAgeGate ? 'On' : 'Off'],
                ['Ads', settings.ads.enabled ? 'On' : 'Off'],
                ['Home hero', settings.ui.showHomeHero !== false ? 'On' : 'Off'],
                ['Categories', settings.ui.categoriesEnabled !== false ? 'On' : 'Off'],
                ['Demo videos', settings.ui.showDemoDataWhenFirebaseEmpty ? 'On' : 'Off']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-600">{label}</p>
                  <p className="mt-1 font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="relative">
            <h2 className="text-xl font-black text-white">Recent videos</h2>
            <div className="mt-4 space-y-3">
              {recent.map((video) => (
                <div key={video.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    {video.thumbnail ? <img src={video.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-rose-500 to-fuchsia-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{video.title}</p>
                    <p className="text-xs font-semibold text-zinc-500">{video.category} • {video.status}</p>
                  </div>
                </div>
              ))}
              {!recent.length && <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">No videos added yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoiceRail({ items, value, onChange }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1.5">
      {items.map((item) => (
        <button
          key={item.value || item}
          type="button"
          onClick={() => onChange(item.value || item)}
          className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.15em] transition ${
            value === (item.value || item)
              ? 'bg-rose-500 text-white shadow-glow'
              : 'text-zinc-400 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          {item.label || item}
        </button>
      ))}
    </div>
  );
}

function VideoForm({ value, setValue, settings, onSave, onCancel, busy }) {
  const categories = settings.ui.categories.filter((item) => item !== 'All');

  const setField = (field, nextValue) => {
    setValue((current) => ({ ...current, [field]: nextValue }));
  };

  return (
    <form onSubmit={onSave} className="admin-card space-y-5 overflow-hidden">
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">{value.id ? 'Edit video' : 'Add video'}</h2>
          <p className="mt-1 text-sm text-zinc-500">Add embed links, metadata, tags, and visibility.</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-2xl border border-white/10 p-3 text-zinc-400 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="relative grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
        <div className="min-w-0 space-y-4">
          <div>
            <label className="admin-label">Title</label>
            <input className="admin-field" value={value.title} onChange={(event) => setField('title', event.target.value)} required placeholder="Video title" />
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Thumbnail URL</label>
              <div className="relative">
                <Image className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                <input className="admin-field pl-11" value={value.thumbnail} onChange={(event) => setField('thumbnail', event.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="admin-label">Embed video URL</label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                <input className="admin-field pl-11" value={value.embedUrl} onChange={(event) => setField('embedUrl', event.target.value)} placeholder="https://platform.com/embed/..." />
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            <div>
              <label className="admin-label">Views</label>
              <input className="admin-field" value={value.views} onChange={(event) => setField('views', event.target.value)} placeholder="25K" />
            </div>
            <div>
              <label className="admin-label">Duration</label>
              <input className="admin-field" value={value.duration} onChange={(event) => setField('duration', event.target.value)} placeholder="12:40" />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <ChoiceRail
                items={[{ label: 'Active', value: 'active' }, { label: 'Hidden', value: 'hidden' }]}
                value={value.status}
                onChange={(next) => setField('status', next)}
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Direct link button URL</label>
            <input className="admin-field" value={value.directLink} onChange={(event) => setField('directLink', event.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="admin-label">Tags, comma separated</label>
            <input className="admin-field" value={value.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="tag1, tag2" />
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <label className="admin-label">Category</label>
            <ChoiceRail items={categories.length ? categories : ['Latest']} value={value.category} onChange={(next) => setField('category', next)} />
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
            <p className="text-sm font-black text-white">Preview metadata</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <p className="flex items-center gap-2"><Tag size={16} className="text-rose-200" /> {value.category || 'Latest'}</p>
              <p className="flex items-center gap-2"><Eye size={16} className="text-rose-200" /> {value.views || '0'} views</p>
              <p className="flex items-center gap-2"><Clock size={16} className="text-rose-200" /> {value.duration || '00:00'}</p>
            </div>
          </div>
        </div>
      </div>

      <AdminButton disabled={busy} className="premium-button">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {busy ? 'Saving...' : 'Save video'}
      </AdminButton>
    </form>
  );
}

function VideosPage({ videos, settings, reloadVideos, notify }) {
  const [form, setForm] = useState(emptyVideo);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return videos;
    return videos.filter((video) => [video.title, video.category, video.status, ...video.tags].join(' ').toLowerCase().includes(normalized));
  }, [videos, search]);

  const saveVideo = async (event) => {
    event.preventDefault();
    setBusy(true);

    const payload = {
      title: form.title.trim(),
      thumbnail: form.thumbnail.trim(),
      views: form.views.trim() || '0',
      duration: form.duration.trim() || '00:00',
      category: form.category || 'Latest',
      tags: stringToTags(form.tags),
      embedUrl: form.embedUrl.trim(),
      directLink: form.directLink.trim(),
      status: form.status || 'active',
      updatedAt: Date.now()
    };

    try {
      if (form.id) {
        await updateDoc(doc(db, siteConfig.firebase.videosCollection, form.id), payload);
      } else {
        await addDoc(collection(db, siteConfig.firebase.videosCollection), {
          ...payload,
          createdAt: Date.now()
        });
      }
      setForm(emptyVideo);
      await reloadVideos();
      notify('success', form.id ? 'Video updated' : 'Video added', 'Your changes are live in the admin list.');
    } catch (error) {
      notify('error', 'Video save failed', error.message || 'Could not save the video.');
    } finally {
      setBusy(false);
    }
  };

  const editVideo = (video) => {
    setForm({ ...video, tags: tagsToString(video.tags) });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (video) => {
    try {
      await updateDoc(doc(db, siteConfig.firebase.videosCollection, video.id), {
        status: video.status === 'active' ? 'hidden' : 'active',
        updatedAt: Date.now()
      });
      await reloadVideos();
      notify('success', video.status === 'active' ? 'Video hidden' : 'Video published');
    } catch (error) {
      notify('error', 'Status update failed', error.message || 'Could not update status.');
    }
  };

  const removeVideo = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, siteConfig.firebase.videosCollection, deleteTarget.id));
      setDeleteTarget(null);
      await reloadVideos();
      notify('success', 'Video deleted', 'The video was removed from Firestore.');
    } catch (error) {
      notify('error', 'Delete failed', error.message || 'Could not delete the video.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {deleteTarget && (
        <ConfirmDialog
          danger
          busy={busy}
          title="Delete this video?"
          message={`This will permanently remove “${deleteTarget.title}” from Firestore. This action cannot be undone.`}
          confirmText="Delete video"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={removeVideo}
        />
      )}

      <div className="premium-card rounded-[2.25rem] p-6 sm:p-8">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageTitle eyebrow="Content" title="Videos" description="Create, edit, hide, publish, and remove video cards with a faster mobile-friendly workflow." />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-zinc-500 lg:w-80">
            <Search size={18} />
            <input className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos..." />
          </label>
        </div>
      </div>

      <VideoForm value={form} setValue={setForm} settings={settings} onSave={saveVideo} onCancel={form.id ? () => setForm(emptyVideo) : null} busy={busy} />

      <div className="admin-card overflow-hidden p-0">
        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Video list</h2>
          <span className="status-pill">{filtered.length} shown</span>
        </div>

        <div className="relative divide-y divide-white/10">
          {filtered.map((video) => (
            <div key={video.id} className="grid gap-4 p-4 transition hover:bg-white/[0.035] md:grid-cols-[104px_1fr_auto] md:items-center">
              <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10">
                {video.thumbnail ? <img src={video.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-rose-500 to-fuchsia-500" />}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-black text-white">{video.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{video.category} • {video.views} views • {video.duration}</p>
                <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${video.status === 'active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-zinc-500/10 text-zinc-400'}`}>{video.status}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <AdminButton onClick={() => editVideo(video)} className="border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"><Pencil size={16} /> Edit</AdminButton>
                <AdminButton onClick={() => toggleStatus(video)} className="border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white">{video.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />} {video.status === 'active' ? 'Hide' : 'Show'}</AdminButton>
                <AdminButton onClick={() => setDeleteTarget(video)} className="border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"><Trash2 size={16} /> Delete</AdminButton>
              </div>
            </div>
          ))}

          {!filtered.length && <p className="p-8 text-center text-zinc-500">No videos found.</p>}
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, help }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/[0.055]"
    >
      <span>
        <span className="block font-black text-white">{label}</span>
        {help && <span className="mt-1 block text-sm leading-5 text-zinc-500">{help}</span>}
      </span>
      <span className={`h-7 w-12 rounded-full p-1 transition ${checked ? 'bg-rose-500 shadow-glow' : 'bg-zinc-800'}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

function SettingsPage({ settings, setSettings, saveSettings, adminPath, busy }) {
  const setNested = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-5">
      <div className="premium-card rounded-[2.25rem] p-6 sm:p-8">
        <div className="relative">
          <PageTitle eyebrow="Control" title="Settings" description="Update branding, categories, age gate behavior, and admin path guidance." />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="admin-card space-y-4">
          <div className="relative">
            <h2 className="text-xl font-black text-white">Branding</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="admin-label">Website name</label>
                <input className="admin-field" value={settings.brand.name} onChange={(event) => setNested('brand', 'name', event.target.value)} />
              </div>
              <div>
                <label className="admin-label">Short logo text</label>
                <input className="admin-field" value={settings.brand.shortName} onChange={(event) => setNested('brand', 'shortName', event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Logo image URL</label>
                <input className="admin-field" value={settings.brand.logoUrl} onChange={(event) => setNested('brand', 'logoUrl', event.target.value)} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Tagline</label>
                <input className="admin-field" value={settings.brand.tagline} onChange={(event) => setNested('brand', 'tagline', event.target.value)} />
              </div>
              <div>
                <label className="admin-label">Domain hint</label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                  <input className="admin-field pl-11" value={settings.brand.domainHint} onChange={(event) => setNested('brand', 'domainHint', event.target.value)} />
                </div>
              </div>
              <div>
                <label className="admin-label">Support email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                  <input className="admin-field pl-11" value={settings.brand.supportEmail} onChange={(event) => setNested('brand', 'supportEmail', event.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="relative">
            <h2 className="text-xl font-black text-white">Live preview</h2>
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 font-black text-white shadow-glow">
                  {settings.brand.logoUrl ? <img src={settings.brand.logoUrl} alt="" className="h-full w-full object-cover" /> : settings.brand.shortName}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-white">{settings.brand.name}</p>
                  <p className="truncate text-sm text-zinc-500">{settings.brand.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card space-y-4">
        <div className="relative">
          <h2 className="text-xl font-black text-white">Website behavior</h2>
          <div className="mt-4 space-y-3">
            <Toggle checked={settings.legal.showAgeGate} onChange={(value) => setNested('legal', 'showAgeGate', value)} label="Age confirmation" help="Turn the age confirmation popup on or off." />
            <Toggle checked={settings.ui.showHomeHero !== false} onChange={(value) => setNested('ui', 'showHomeHero', value)} label="Home hero section" help="Show or hide the top section that says Smooth previews for every screen." />
            <Toggle checked={settings.ui.categoriesEnabled !== false} onChange={(value) => setNested('ui', 'categoriesEnabled', value)} label="Categories feature" help="Turn public category chips, category filtering, and category labels on or off." />
            <Toggle checked={settings.ui.showDemoDataWhenFirebaseEmpty} onChange={(value) => setNested('ui', 'showDemoDataWhenFirebaseEmpty', value)} label="Demo videos" help="Show demo cards only when Firebase has no active videos. Turn off when your real videos are ready." />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Minimum age</label>
              <input className="admin-field" type="number" value={settings.legal.minimumAge} onChange={(event) => setNested('legal', 'minimumAge', Number(event.target.value || 18))} />
            </div>
            <div>
              <label className="admin-label">Items before ad break</label>
              <input className="admin-field" type="number" value={settings.ui.itemsPerAdBreak} onChange={(event) => setNested('ui', 'itemsPerAdBreak', Number(event.target.value || 8))} />
            </div>
          </div>

          <div className={`mt-4 ${settings.ui.categoriesEnabled === false ? 'opacity-60' : ''}`}>
            <label className="admin-label">Categories, comma separated</label>
            <input
              className="admin-field"
              value={(settings.ui.categories || []).join(', ')}
              onChange={(event) => setNested('ui', 'categories', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
            />
            <p className="mt-2 text-xs text-zinc-500">Keep “All” as the first category. When categories are off, these are saved but hidden from visitors.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
            <p className="font-black text-white">Current admin URL: {adminPath}</p>
            <p className="mt-1">To change it, set <code className="text-rose-200">VITE_ADMIN_PATH=/your-path</code> in .env or your hosting environment variables, then redeploy.</p>
          </div>
        </div>
      </div>

      <AdminButton onClick={saveSettings} disabled={busy} className="premium-button">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {busy ? 'Saving...' : 'Save settings'}
      </AdminButton>
    </div>
  );
}

function AdsPage({ settings, setSettings, saveSettings, busy }) {
  const setAds = (field, value) => {
    setSettings((current) => ({ ...current, ads: { ...current.ads, [field]: value } }));
  };

  const updateButton = (index, field, value) => {
    setSettings((current) => {
      const buttons = [...(current.ads.directButtons || [])];
      buttons[index] = { ...buttons[index], [field]: value };
      return { ...current, ads: { ...current.ads, directButtons: buttons } };
    });
  };

  const addButton = () => {
    setSettings((current) => ({
      ...current,
      ads: {
        ...current.ads,
        directButtons: [...(current.ads.directButtons || []), { label: 'New Button', url: '', enabled: false }]
      }
    }));
  };

  const removeButton = (index) => {
    setSettings((current) => ({
      ...current,
      ads: {
        ...current.ads,
        directButtons: current.ads.directButtons.filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  };

  const scriptSlots = [
    ['popunderEnabled', 'popunderScriptUrl', 'Popunder script'],
    ['socialBarEnabled', 'socialBarScriptUrl', 'Social bar script']
  ];

  const htmlSlots = [
    ['topBannerEnabled', 'topBannerHtml', 'Top banner'],
    ['inFeedBannerEnabled', 'inFeedBannerHtml', 'In-feed banner'],
    ['watchPageBannerEnabled', 'watchPageBannerHtml', 'Watch page banner'],
    ['nativeBannerEnabled', 'nativeBannerHtml', 'Native/sidebar banner']
  ];

  return (
    <div className="space-y-5">
      <div className="premium-card rounded-[2.25rem] p-6 sm:p-8">
        <div className="relative">
          <PageTitle eyebrow="Monetization" title="Ads setup" description="Control the master ad switch, each individual placement, global scripts, and direct-link buttons." />
        </div>
      </div>

      <div className="admin-card space-y-4">
        <div className="relative space-y-4">
          <Toggle checked={settings.ads.enabled} onChange={(value) => setAds('enabled', value)} label="Master ads switch" help="Turn this off to hide every ad placement and global ad script immediately." />

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {scriptSlots.map(([enabledField, urlField, label]) => (
              <div key={urlField} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <Toggle checked={settings.ads[enabledField] !== false} onChange={(value) => setAds(enabledField, value)} label={`${label} ${settings.ads[enabledField] !== false ? 'on' : 'off'}`} help="This script obeys the master ads switch too." />
                <label className="admin-label mt-4">{label} URL</label>
                <input className="admin-field" value={settings.ads[urlField] || ''} onChange={(event) => setAds(urlField, event.target.value)} placeholder="https://...js" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card space-y-4">
        <div className="relative">
          <h2 className="text-xl font-black text-white">Ad HTML slots</h2>
          <p className="mt-1 text-sm text-zinc-500">Each placement has its own on/off switch, so you can disable one ad without removing the code.</p>
          <div className="mt-4 grid gap-4">
            {htmlSlots.map(([enabledField, htmlField, label]) => (
              <div key={htmlField} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <Toggle checked={settings.ads[enabledField] !== false} onChange={(value) => setAds(enabledField, value)} label={`${label} ${settings.ads[enabledField] !== false ? 'on' : 'off'}`} help="This slot also respects the master ads switch." />
                <label className="admin-label mt-4">{label} HTML</label>
                <textarea className="admin-field custom-scroll min-h-28" value={settings.ads[htmlField] || ''} onChange={(event) => setAds(htmlField, event.target.value)} placeholder="Paste ad network HTML code here" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card space-y-4">
        <div className="relative">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Direct-link buttons</h2>
              <p className="mt-1 text-sm text-zinc-500">Buttons shown below the video player. Each one can be turned on/off individually.</p>
            </div>
            <AdminButton onClick={addButton} className="border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"><Plus size={16} /> Add</AdminButton>
          </div>

          <div className="mt-4 space-y-3">
            {(settings.ads.directButtons || []).map((button, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] lg:items-end">
                  <div className="min-w-0">
                    <label className="admin-label">Label</label>
                    <input className="admin-field" value={button.label} onChange={(event) => updateButton(index, 'label', event.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <label className="admin-label">URL</label>
                    <input className="admin-field" value={button.url} onChange={(event) => updateButton(index, 'url', event.target.value)} placeholder="https://..." />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminButton onClick={() => updateButton(index, 'enabled', !button.enabled)} className={button.enabled ? 'bg-rose-500 text-white shadow-glow' : 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white'}>{button.enabled ? 'On' : 'Off'}</AdminButton>
                    <AdminButton onClick={() => removeButton(index)} className="border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"><Trash2 size={16} /></AdminButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminButton onClick={saveSettings} disabled={busy} className="premium-button">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {busy ? 'Saving...' : 'Save ad settings'}
      </AdminButton>
    </div>
  );
}

export default function AdminApp({ adminPath, settings, setSettings, reloadPublicSettings }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notice, setNotice] = useState(null);
  const location = useLocation();
  const page = adminSegment(location.pathname, adminPath);

  const notify = (type, title, message = '') => setNotice({ type, title, message, id: Date.now() });

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  const reloadVideos = async () => {
    if (!db || !user) return;
    setLoadingVideos(true);
    try {
      const snapshot = await getDocs(collection(db, siteConfig.firebase.videosCollection));
      const list = snapshot.docs.map((item) => normalizeVideo({ id: item.id, ...item.data() }, item.id));
      setVideos(sortNewestFirst(list));
    } catch (error) {
      notify('error', 'Could not refresh videos', error.message || 'Firebase request failed.');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (user) reloadVideos();
  }, [user]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await setDoc(
        doc(db, siteConfig.firebase.settingsCollection, siteConfig.firebase.publicSettingsDoc),
        serializeSettings(settings),
        { merge: true }
      );
      await reloadPublicSettings();
      notify('success', 'Settings saved', 'Your public website settings were updated.');
    } catch (error) {
      notify('error', 'Settings save failed', error.message || 'Could not save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (!hasFirebaseConfig || !db || !auth) return <ConfigMissing adminPath={adminPath} />;

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-10 text-center text-zinc-500">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <Loader2 className="animate-spin text-rose-200" /> Loading admin...
        </div>
      </main>
    );
  }

  if (!user) return <LoginScreen adminPath={adminPath} />;

  let content = <DashboardPage videos={videos} settings={settings} adminPath={adminPath} />;
  if (page === 'videos') content = <VideosPage videos={videos} settings={settings} reloadVideos={reloadVideos} notify={notify} />;
  if (page === 'settings') {
    content = (
      <SettingsPage
        settings={settings}
        setSettings={setSettings}
        saveSettings={saveSettings}
        adminPath={adminPath}
        busy={savingSettings}
      />
    );
  }
  if (page === 'ads') {
    content = <AdsPage settings={settings} setSettings={setSettings} saveSettings={saveSettings} busy={savingSettings} />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,0.13),transparent_28%),linear-gradient(180deg,#09090b,#000)]" />
      <Sidebar page={page} adminPath={adminPath} user={user} />
      <main className="px-3 py-5 sm:px-4 lg:ml-72 lg:px-8">
        {loadingVideos && <p className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-400"><Loader2 size={16} className="animate-spin text-rose-200" /> Refreshing videos...</p>}
        {content}
      </main>
      <button onClick={() => signOut(auth)} className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-zinc-200 shadow-soft backdrop-blur-xl lg:hidden" aria-label="Logout">
        <LogOut size={19} />
      </button>
      <Toast notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
