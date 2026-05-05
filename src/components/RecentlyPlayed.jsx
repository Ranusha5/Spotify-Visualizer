import { motion } from 'framer-motion';

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

function TrackTile({ item, idx }) {
  const playedAt = item?.played_at;
  const track = item?.track;

  return (
    <motion.div
      className="relative group overflow-hidden rounded-xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.03 }}
      whileHover={{ scale: 1.05 }}
    >
      <img
        src={track?.album?.images?.[2]?.url || track?.album?.images?.[0]?.url || 'https://via.placeholder.com/100'}
        alt={track?.name}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white font-semibold text-sm truncate">{track?.name}</p>
        <p className="text-textSubtle text-xs truncate">{track?.artists?.[0]?.name}</p>
        <p className="text-textSubtle/60 text-xs mt-1">{formatDate(playedAt)}</p>
      </div>
    </motion.div>
  );
}

export default function RecentlyPlayed({ items, loading }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-spotify rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <h2 className="section-title">Recently Played</h2>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
          <p className="text-textSubtle">Loading your recent tracks...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.slice(0, 18).map((item, idx) => (
            <TrackTile key={item.played_at} item={item} idx={idx} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-textSubtle text-lg">No recently played tracks. Listen to some music!</p>
        </div>
      )}
    </div>
  );
}
