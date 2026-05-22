import { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import AdminApp from './admin/AdminApp';
import AgeGate from './components/AgeGate';
import Footer from './components/Footer';
import Header from './components/Header';
import { GlobalAdScripts } from './components/AdSlot';
import { getAdminPath, siteConfig } from './config/siteConfig';
import { demoVideos } from './data/demoVideos';
import { db, hasFirebaseConfig } from './firebase';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import WatchPage from './pages/WatchPage';
import { normalizeSettings, normalizeVideo, sortNewestFirst } from './utils/format';

function isAdminRoute(pathname, adminPath) {
  return pathname === adminPath || pathname.startsWith(`${adminPath}/`);
}

export default function App() {
  const location = useLocation();
  const adminPath = getAdminPath();
  const adminMode = isAdminRoute(location.pathname, adminPath);

  const [settings, setSettings] = useState(() => normalizeSettings(siteConfig));
  const [settingsLoaded, setSettingsLoaded] = useState(!hasFirebaseConfig || !db);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState(siteConfig.ui.defaultCategory);

  const reloadPublicSettings = useCallback(async () => {
    if (!hasFirebaseConfig || !db) {
      setSettings(normalizeSettings(siteConfig));
      setSettingsLoaded(true);
      return;
    }

    try {
      const settingsRef = doc(
        db,
        siteConfig.firebase.settingsCollection,
        siteConfig.firebase.publicSettingsDoc
      );
      const snapshot = await getDoc(settingsRef);
      setSettings(normalizeSettings(snapshot.exists() ? snapshot.data() : siteConfig));
    } catch (error) {
      console.error('Could not load public settings:', error);
      setSettings(normalizeSettings(siteConfig));
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  const reloadPublicVideos = useCallback(async (currentSettings = settings) => {
    setLoadingVideos(true);

    try {
      if (!hasFirebaseConfig || !db) {
        setVideos(
          currentSettings.ui.showDemoDataWhenFirebaseEmpty
            ? demoVideos.map((item) => normalizeVideo(item, item.id))
            : []
        );
        return;
      }

      const videosRef = collection(db, siteConfig.firebase.videosCollection);
      const activeQuery = query(videosRef, where('status', '==', 'active'));
      const snapshot = await getDocs(activeQuery);

      const loaded = sortNewestFirst(
        snapshot.docs.map((videoDoc) =>
          normalizeVideo({ id: videoDoc.id, ...videoDoc.data() }, videoDoc.id)
        )
      );

      setVideos(
        loaded.length
          ? loaded
          : currentSettings.ui.showDemoDataWhenFirebaseEmpty
            ? demoVideos.map((item) => normalizeVideo(item, item.id))
            : []
      );
    } catch (error) {
      console.error('Could not load videos:', error);
      setVideos(
        currentSettings.ui.showDemoDataWhenFirebaseEmpty
          ? demoVideos.map((item) => normalizeVideo(item, item.id))
          : []
      );
    } finally {
      setLoadingVideos(false);
    }
  }, [settings]);

  useEffect(() => {
    reloadPublicSettings();
  }, [reloadPublicSettings]);

  useEffect(() => {
    if (settingsLoaded) reloadPublicVideos(settings);
  }, [settingsLoaded, settings.ui.showDemoDataWhenFirebaseEmpty, reloadPublicVideos]);

  useEffect(() => {
    document.title = settings.brand?.name || 'Video Site';
  }, [settings.brand?.name]);

  useEffect(() => {
    if (!settings.ui.categoriesEnabled) {
      setCategory(settings.ui.defaultCategory || 'All');
      return;
    }

    if (!settings.ui.categories.includes(category)) {
      setCategory(settings.ui.defaultCategory || 'All');
    }
  }, [settings.ui.categories, settings.ui.defaultCategory, settings.ui.categoriesEnabled, category]);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = queryText.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesCategory = !settings.ui.categoriesEnabled || category === 'All' || video.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [video.title, video.category, ...video.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [videos, category, queryText, settings.ui.categoriesEnabled]);

  if (adminMode) {
    return (
      <AdminApp
        adminPath={adminPath}
        settings={settings}
        setSettings={setSettings}
        reloadPublicSettings={reloadPublicSettings}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 font-body text-zinc-100 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(244,63,94,0.2),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(168,85,247,0.16),transparent_28%),linear-gradient(180deg,#08080b,#020203_70%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      {settingsLoaded && (
        <AgeGate
          enabled={settings.legal.showAgeGate}
          minimumAge={settings.legal.minimumAge}
          storageKey={settings.legal.ageGateStorageKey}
        />
      )}

      <GlobalAdScripts settings={settings} />

      <Header
        settings={settings}
        query={queryText}
        setQuery={setQueryText}
        category={category}
        setCategory={setCategory}
      />

      <Routes>
        <Route
          path="/"
          element={<HomePage videos={filteredVideos} allVideos={videos} loading={loadingVideos} settings={settings} category={category} query={queryText} />}
        />
        <Route path="/watch/:id" element={<WatchPage videos={videos} settings={settings} />} />
        <Route path="/legal" element={<LegalPage settings={settings} />} />
        <Route path="*" element={<HomePage videos={filteredVideos} allVideos={videos} loading={loadingVideos} settings={settings} category={category} query={queryText} />} />
      </Routes>

      <Footer settings={settings} />
    </div>
  );
}
