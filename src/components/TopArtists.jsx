import { motion } from 'framer-motion';

function ArtistCard({ artist, rank }) {
  const genres = artist?.genres?.slice(0, 3) || [];

  return (
    <motion.div
      className="card group cursor-pointer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <span className="absolute -left-2 -top-2 w-8 h-8 bg-spotify text-black font-bold rounded-full flex items-center justify-center text-sm z-10 shadow-glow">
            {rank}
          </span>
          <img
            src={artist?.images?.[0]?.url || 'https://via.placeholder.com/64'}
            alt={artist?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-spotify transition-colors shadow-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate group-hover:text-spotify transition-colors">
            {artist?.name}
          </h3>
          <p className="text-textSubtle text-sm mb-2">
            {artist?.followers?.total.toLocaleString()} followers
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-surfaceHover text-textSubtle text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TopArtists({ artists, loading }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-spotify rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h2 className="section-title">Top Artists</h2>
      </div>

      {loading && artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
          <p className="text-textSubtle">Loading your top artists...</p>
        </div>
      ) : artists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artists.map((artist, idx) => (
            <ArtistCard key={artist.id} artist={artist} rank={idx + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-textSubtle text-lg">No artists available. Try logging in again.</p>
        </div>
      )}
    </div>
  );
}
