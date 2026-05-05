import { useState, useCallback } from 'react';
import { TOKEN_KEY, refreshToken } from '../utils/auth';

const BASE_URL = 'https://api.spotify.com/v1';

const TIME_RANGES = {
  short: 'short_term',
  medium: 'medium_term',
  long: 'long_term',
};

export function useSpotify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const data = await refreshToken();
      token = data?.access_token || null;
    }
    return token;
  }, []);

  const fetchSpotify = useCallback(async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');

      const url = new URL(`${BASE_URL}${endpoint}`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed?.access_token) {
          return fetchSpotify(endpoint, params);
        }
        throw new Error('Session expired');
      }

      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const getTopTracks = useCallback(async (range = 'medium') => {
    return fetchSpotify('/me/top/tracks', { limit: 10, time_range: TIME_RANGES[range] });
  }, [fetchSpotify]);

  const getTopArtists = useCallback(async (range = 'medium') => {
    return fetchSpotify('/me/top/artists', { limit: 10, time_range: TIME_RANGES[range] });
  }, [fetchSpotify]);

  const getRecentlyPlayed = useCallback(async () => {
    return fetchSpotify('/me/player/recently-played', { limit: 50 });
  }, [fetchSpotify]);

  const getAudioFeatures = useCallback(async (trackIds) => {
    if (!trackIds || trackIds.length === 0) return null;
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    const chunks = [];
    for (let i = 0; i < ids.length; i += 100) {
      chunks.push(ids.slice(i, i + 100).join(','));
    }
    const results = await Promise.all(
      chunks.map(ids => fetchSpotify(`/audio-features?ids=${ids}`))
    );
    return results.flatMap(r => r?.audio_features || []);
  }, [fetchSpotify]);

  return {
    getTopTracks,
    getTopArtists,
    getRecentlyPlayed,
    getAudioFeatures,
    loading,
    error,
  };
}
