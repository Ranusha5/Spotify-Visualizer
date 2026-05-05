import { motion } from 'framer-motion';

function getMusicPersonality(features) {
  if (!features || features.length === 0) return null;

  const avg = {
    energy: features.reduce((a, b) => a + (b.energy || 0), 0) / features.length,
    danceability: features.reduce((a, b) => a + (b.danceability || 0), 0) / features.length,
    valence: features.reduce((a, b) => a + (b.valence || 0), 0) / features.length,
    acousticness: features.reduce((a, b) => a + (b.acousticness || 0), 0) / features.length,
  };

  let name, description, emoji, color;
  if (avg.energy > 0.7 && avg.danceability > 0.7) {
    name = 'Party Starter';
    description = 'High energy, highly danceable tracks. You bring the vibes wherever you go!';
    emoji = '🎉';
    color = 'from-pink-500 to-rose-500';
  } else if (avg.energy < 0.4 && avg.acousticness > 0.6) {
    name = 'Chill Seeker';
    description = 'You appreciate the softer side of music. Acoustic and mellow is your vibe.';
    emoji = '🌿';
    color = 'from-emerald-500 to-teal-500';
  } else if (avg.valence > 0.7) {
    name = 'Sunshine Soul';
    description = 'Your playlists are full of happiness. You gravitate toward feel-good tracks.';
    emoji = '☀️';
    color = 'from-amber-400 to-orange-500';
  } else if (avg.valence < 0.3) {
    name = 'Midnight Moods';
    description = 'Deep, emotional tracks. You connect with music on an introspective level.';
    emoji = '🌙';
    color = 'from-indigo-500 to-purple-500';
  } else {
    name = 'Genre Explorer';
    description = 'Eclectic taste across many styles. You are hard to categorize!';
    emoji = '🎵';
    color = 'from-blue-500 to-cyan-500';
  }

  return { name, description, emoji, color, avg };
}

function StatBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-textSubtle">{label}</span>
        <span className="text-white font-medium">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export default function Personality({ tracks, audioFeatures, loading }) {
  const personality = getMusicPersonality(audioFeatures);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-spotify rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2 className="section-title">Your Music Personality</h2>
      </div>

      {loading && !personality ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-spotify/30 border-t-spotify rounded-full animate-spin mb-4" />
          <p className="text-textSubtle">Analyzing your taste...</p>
        </div>
      ) : personality ? (
        <motion.div
          className="card bg-gradient-to-br from-surface to-surfaceHover border border-textSubtle/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="text-7xl mb-4 inline-block"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              {personality.emoji}
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-2">{personality.name}</h3>
            <p className="text-textSubtle max-w-md mx-auto">{personality.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-textSubtle/10">
            <StatBar label="Energy" value={personality.avg.energy} color="from-rose-500 to-orange-500" />
            <StatBar label="Danceability" value={personality.avg.danceability} color="from-violet-500 to-fuchsia-500" />
            <StatBar label="Happiness" value={personality.avg.valence} color="from-amber-400 to-yellow-500" />
            <StatBar label="Acousticness" value={personality.avg.acousticness} color="from-emerald-400 to-cyan-500" />
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <p className="text-textSubtle text-lg">Not enough audio data yet. Listen more!</p>
        </div>
      )}
    </div>
  );
}
