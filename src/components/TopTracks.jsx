import { motion } from 'framer-motion';

function TrackCard({ track, rank }) {
  return (
    <motion.div
      className="card flex items-center gap-4 cursor-pointer group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-spotify font-bold text-xl w-8 text-center">
        #{rank}
      </div>
      <img
        src={track?.album?.images?.[0]?.url || 'https://via.placeholder.com/56'}
        alt={track?.name}
        className="w-14 h-14 rounded-md object-cover shadow-lg"
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold truncate group-hover:text-spotify transition-colors">
          {track?.name}
        </h3>
        <p className="text-textSubtle text-sm truncate">
          {track?.artists?.map(a => a.name).join(', ')}
        </p>
      </div>
      <button
        className="w-10 h-10 bg-spotify rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-spotifyHover"
        title="Play on Spotify"
      >
        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </motion.div>
  );
}

export default function TopTracks({ tracks, loading }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-spotify rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <h2 className="section-title">Top Tracks</h2>
      </div>

      {loading && tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
          <p className="text-textSubtle">Loading your top tracks...</p>
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-3">
          {tracks.map((track, idx) => (
            <TrackCard key={track.id} track={track} rank={idx + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-textSubtle text-lg">No tracks available. Try logging in again.</p>
        </div>
      )}

      {tracks.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-textSubtle text-sm mt-8"
        >
          These are your most-played tracks from Spotify
        </motion.p>
      )}
    </div>
  );
}
