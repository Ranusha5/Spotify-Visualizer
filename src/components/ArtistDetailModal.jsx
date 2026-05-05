import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MARKETS = 'AU';

function AlbumGrid({ albums }) {
  if (!albums?.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white mb-3">Discography ({albums.length})</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {albums.slice(0, 15).map((alb) => (
          <div key={alb.id} className="group cursor-pointer">
            <img
              src={alb.images?.[0]?.url || 'https://via.placeholder.com/100'}
              alt={alb.name}
              className="w-full aspect-square object-cover rounded-lg group-hover:opacity-80 transition-opacity"
            />
            <p className="text-white text-sm font-medium truncate mt-1">{alb.name}</p>
            <p className="text-textSubtle text-xs">
              {alb.release_date?.slice(0, 4)} - {alb.total_tracks} tracks
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedArtistsRow({ artists, onArtistClick }) {
  if (!artists?.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white mb-3">Similar Artists</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {artists.slice(0, 20).map((art) => (
          <button
            key={art.id}
            className="flex-shrink-0 w-32 text-center group"
            onClick={() => onArtistClick(art)}
          >
            <img
              src={art.images?.[0]?.url || 'https://via.placeholder.com/96'}
              alt={art.name}
              className="w-24 h-24 rounded-full object-cover mx-auto group-hover:opacity-80 transition-opacity"
            />
            <p className="text-white text-sm font-medium truncate mt-2">{art.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ArtistDetailModal({ artist, onClose, onArtistClick, spotify }) {
  const [profile, setProfile] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artist?.id) return;
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      const [p, a, t, r] = await Promise.all([
        spotify.getArtistDetail(artist.id),
        spotify.getArtistAlbums(artist.id),
        spotify.getArtistTopTracks(artist.id),
        spotify.getRelatedArtists(artist.id),
      ]);
      if (!cancelled) {
        setProfile(p);
        setAlbums(a || []);
        setTopTracks(t?.tracks || []);
        setRelated(r?.artists || []);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [artist?.id]);

  const p = profile || artist;
  const genres = p?.genres || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
              <p className="text-textSubtle">Loading artist details...</p>
            </div>
          ) : p ? (
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={p.images?.[0]?.url || 'https://via.placeholder.com/160'}
                  alt={p.name}
                  className="w-40 h-40 rounded-lg object-cover shadow-xl"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-1">{p.name}</h2>
                  <span className="inline-block px-3 py-1 bg-spotify/20 text-spotify text-sm rounded-full mb-3">
                    Popularity: {p.popularity || 0}/100
                  </span>
                  <p className="text-textSubtle text-lg mb-2">
                    {p.followers?.total?.toLocaleString()} followers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 8).map((g) => (
                      <span key={g} className="px-2 py-1 bg-surfaceHover text-textSubtle text-xs rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {topTracks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-3">Top Tracks</h3>
                  <div className="space-y-2">
                    {topTracks.slice(0, 10).map((track, idx) => (
                      <div key={track.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surfaceHover transition-colors">
                        <span className="text-spotify font-bold w-6">{idx + 1}</span>
                        <img src={track.album?.images?.[2]?.url} alt="" className="w-10 h-10 rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{track.name}</p>
                          <p className="text-textSubtle text-sm truncate">{track.artists?.[0]?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AlbumGrid albums={albums} />
              <RelatedArtistsRow artists={related} onArtistClick={onArtistClick} />
            </div>
          ) : null}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-surfaceHover rounded-full flex items-center justify-center text-white hover:bg-surface transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
