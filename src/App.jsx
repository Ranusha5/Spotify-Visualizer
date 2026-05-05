import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotify } from './hooks/useSpotify';
import Login from './components/Login';
import TopTracks from './components/TopTracks';
import TopArtists from './components/TopArtists';
import Personality from './components/Personality';
import RecentlyPlayed from './components/RecentlyPlayed';
import GenreExplorer from './components/GenreExplorer';
import ArtistDetailModal from './components/ArtistDetailModal';
import GenreDiscoveryPanel from './components/GenreDiscoveryPanel';

const SECTIONS = ['top-tracks', 'top-artists', 'genre', 'recent', 'personality'];

function Header({ onLogout }) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between py-4 px-6 bg-surface/80 backdrop-blur sticky top-0 z-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-spotify rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424c-.18.295-.564.387-.858.207-2.35-1.434-5.308-1.758-8.793-.96-.337.077-.673-.134-.75-.471s.134-.674.471-.751c3.805-.87 7.066-.493 9.722 1.117.295.18.387.564.208.858zm1.224-2.726c-.223.365-.698.477-1.063.254-2.686-1.652-6.78-2.123-9.906-1.147-.409.128-.844-.102-.972-.51-.128-.41.102-.843.512-.97 3.583-1.12 8.12-.592 11.175 1.31.365.225.478.701.254 1.063zm.116-2.821c-3.198-1.897-8.48-2.072-11.56-1.11-.516.161-1.066-.129-1.227-.645-.162-.517.128-1.067.645-1.228 3.536-1.104 9.33-.899 13.002 1.278.462.274.613.87.339 1.333-.275.462-.87.613-1.334.339z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Spotify Visualizer</h1>
      </div>
      <button onClick={onLogout} className="text-textSubtle hover:text-white transition-colors">Logout</button>
    </motion.header>
  );
}

function TimeRangeSelector({ range, onChange }) {
  const ranges = [
    { value: 'short', label: '4 Weeks' },
    { value: 'medium', label: '6 Months' },
    { value: 'long', label: 'All Time' },
  ];
  return (
    <div className="flex justify-center gap-2 mb-8">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            range === r.value
              ? 'bg-spotify text-black shadow-glow'
              : 'bg-surface text-textSubtle hover:bg-surfaceHover hover:text-white'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [timeRange, setTimeRange] = useState('medium');
  const [anchorTime, setAnchorTime] = useState(Date.now());
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const spotify = useSpotify();

  const [data, setData] = useState({
    tracks: [],
    artists: [],
    recentlyPlayed: [],
    audioFeatures: [],
  });
  const [artistsByRange, setArtistsByRange] = useState({
    short: null,
    medium: null,
    long: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentSection(0);
    }
  }, []);

  const handleAuth = async (code) => {
    try {
      const verifier = localStorage.getItem('spotify_code_verifier');
      if (!verifier) return;
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: window.location.origin,
          client_id: 'your_client_id_here',
          code_verifier: verifier,
        }),
      });
      const result = await res.json();
      if (result.access_token) {
        localStorage.setItem('spotify_access_token', result.access_token);
        if (result.refresh_token) {
          localStorage.setItem('spotify_refresh_token', result.refresh_token);
        }
        setIsAuthenticated(true);
        setCurrentSection(0);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_code_challenge');
    setIsAuthenticated(false);
  };

  const nextSection = useCallback(() => {
    setCurrentSection((prev) => (prev + 1) % SECTIONS.length);
  }, []);

  const prevSection = useCallback(() => {
    setCurrentSection((prev) => (prev - 1 + SECTIONS.length) % SECTIONS.length);
  }, []);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setAnchorTime(Date.now());
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      const [tracks, artists, recent] = await Promise.all([
        spotify.getTopTracks(timeRange),
        spotify.getTopArtists(timeRange),
        spotify.getRecentlyPlayed(),
      ]);
      const trackIds = tracks?.items?.map((t) => t.id) || [];
      const features = await spotify.getAudioFeatures(trackIds);
      setData({
        tracks: tracks?.items || [],
        artists: artists?.items || [],
        recentlyPlayed: recent?.items || [],
        audioFeatures: features || [],
      });
    };
    const fetchAllArtists = async () => {
      const results = {};
      for (const r of ['short', 'medium', 'long']) {
        results[r] = await spotify.getTopArtists(r);
      }
      setArtistsByRange(results);
    };
    fetchData();
    fetchAllArtists();
  }, [isAuthenticated, anchorTime, timeRange]);

  const sections = useMemo(() => ({
    'top-tracks': <TopTracks tracks={data.tracks} loading={false} />,
    'top-artists': (
      <TopArtists artists={data.artists} loading={false} onArtistClick={setSelectedArtist} />
    ),
    genre: (
      <GenreExplorer artistsByRange={artistsByRange} onGenreClick={setSelectedGenre} />
    ),
    recent: <RecentlyPlayed items={data.recentlyPlayed} loading={false} />,
    personality: (
      <Personality tracks={data.tracks} audioFeatures={data.audioFeatures} loading={false} />
    ),
  }), [data, artistsByRange]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background"><Login /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Your {timeRange === 'short' ? 'Last 4 Weeks' : timeRange === 'medium' ? 'Last 6 Months' : 'All Time'} on Spotify
          </h2>
          <p className="text-textSubtle">Scroll through your personalized music insights</p>
        </motion.div>

        <TimeRangeSelector range={timeRange} onChange={handleTimeRangeChange} />

        <div className="relative">
          <button
            onClick={prevSection}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-surface/80 hover:bg-surfaceHover rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${SECTIONS[currentSection]}-${anchorTime}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {sections[SECTIONS[currentSection]]}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={nextSection}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-surface/80 hover:bg-surfaceHover rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {SECTIONS.map((section, idx) => (
            <button
              key={section}
              onClick={() => setCurrentSection(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSection ? 'bg-spotify w-8' : 'bg-textSubtle/30 hover:bg-textSubtle/50'
              }`}
            />
          ))}
        </div>
      </div>

      {selectedArtist && (
        <ArtistDetailModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
          onArtistClick={setSelectedArtist}
          spotify={spotify}
        />
      )}

      {selectedGenre && (
        <GenreDiscoveryPanel
          genre={selectedGenre}
          onClose={() => setSelectedGenre(null)}
          spotify={spotify}
        />
      )}
    </div>
  );
}

export default App;
