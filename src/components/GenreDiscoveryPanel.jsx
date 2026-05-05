import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TrackCard({ track }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-surfaceHover transition-colors group">
      <img
        src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || 'https://via.placeholder.com/56'}
        alt={track.name}
        className="w-14 h-14 rounded-md object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate group-hover:text-spotify transition-colors">
          {track.name}
        </p>
        <p className="text-textSubtle text-sm truncate">
          {track.artists?.map((a) => a.name).join(', ')}
        </p>
      </div>
      <a
        href={track.external_urls?.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 bg-spotify rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-spotifyHover"
      >
        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </a>
    </div>
  );
}

export default function GenreDiscoveryPanel({ genre, onClose, spotify }) {
  const [searchTracks, setSearchTracks] = useState([]);
  const [recTracks, setRecTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genre) return;
    setLoading(true);
    const load = async () => {
      const [search, recs] = await Promise.all([
        spotify.searchByGenre(genre),
        spotify.getGenreRecommendations(genre),
      ]);
      setSearchTracks(search?.tracks?.items || []);
      setRecTracks(recs?.tracks || []);
      setLoading(false);
    };
    load();
  }, [genre]);

  const allTracks = [...searchTracks, ...recTracks].filter(
    (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i
  );

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
          className="bg-surface rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-spotify rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">{genre}</h2>
                <p className="text-textSubtle">Discover tracks and recommendations</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
                <p className="text-textSubtle">Searching genre...</p>
              </div>
            ) : allTracks.length > 0 ? (
              <div className="space-y-2">
                {allTracks.slice(0, 40).map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <p className="text-textSubtle text-center py-8">No tracks found for this genre.</p>
            )}
          </div>
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
