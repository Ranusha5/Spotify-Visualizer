import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#1DB954', '#1ed760', '#191414', '#B3B3B3', '#535353', '#282828', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#22c55e'];

function GenreBubble({ genre, count, totalCount, onClick }) {
  const size = 40 + Math.min(70, (count / totalCount) * 100);
  return (
    <motion.button
      className="rounded-full flex items-center justify-center font-bold text-black cursor-pointer"
      style={{ width: size, height: size, backgroundColor: '#1DB954' }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(genre)}
    >
      <span className="text-xs truncate px-2" style={{ maxWidth: size * 0.9 }}>
        {genre}<br /><span className="text-xs opacity-70">{count}</span>
      </span>
    </motion.button>
  );
}

function countGenres(artistsByRange) {
  const counter = {};
  Object.values(artistsByRange).forEach((artists) => {
    (artists?.items || []).forEach((artist) => {
      (artist?.genres || []).forEach((g) => {
        counter[g] = (counter[g] || 0) + 1;
      });
    });
  });
  return Object.entries(counter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function GenreExplorer({ artistsByRange, onGenreClick }) {
  const genres = useMemo(() => countGenres(artistsByRange || {}), [artistsByRange]);
  const topo12 = genres.slice(0, 12);
  const pieData = genres.slice(0, 8).map((g) => ({ name: g.name, value: g.count }));
  const maxCount = genres[0]?.count || 1;
  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-16 text-textSubtle">
        Loading genres...
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-spotify rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
          </svg>
        </div>
        <h2 className="section-title">Genre Explorer</h2>
      </div>
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Your Genre Bubble Map</h3>
        <div className="flex flex-wrap justify-center gap-4 py-8">
          {genres.slice(0, 25).map((g) => (
            <GenreBubble key={g.name} genre={g.name} count={g.count} totalCount={maxCount} onClick={onGenreClick} />
          ))}
        </div>
      </div>
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Top Genres by Frequency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#1DB954" label>
                {pieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ background: '#181818', border: '1px solid #282828', borderRadius: 8, color: '#fff' }}
                labelStyle={{ color: '#1DB954' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
