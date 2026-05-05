import { useState, useCallback } from 'react';
import { TOKEN_KEY, refreshToken, CLIENT_ID } from '../utils/auth';

const BASE_URL = 'https://api.spotify.com/v1';
const MARKETS = 'AU';

const TIME_RANGES = { short: 'short_term', medium: 'medium_term', long: 'long_term' };

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

  const spotifyFetch = useCallback(async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const url = new URL(`${BASE_URL}${endpoint}`);
      if (MARKETS) url.searchParams.append('market', MARKETS);
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed?.access_token) {
          return spotifyFetch(endpoint, params);
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
    return spotifyFetch('/me/top/tracks', { limit: 10, time_range: TIME_RANGES[range] });
  }, [spotifyFetch]);

  const getTopArtists = useCallback(async (range = 'medium') => {
    return spotifyFetch('/me/top/artists', { limit: 10, time_range: TIME_RANGES[range] });
  }, [spotifyFetch]);

  const getRecentlyPlayed = useCallback(async () => {
    return spotifyFetch('/me/player/recently-played', { limit: 50 });
  }, [spotifyFetch]);

  const getAudioFeatures = useCallback(async (trackIds) => {
    if (!trackIds || trackIds.length === 0) return null;
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    const chunks = [];
    for (let i = 0; i < ids.length; i += 100) {
      chunks.push(ids.slice(i, i + 100).join(','));
    }
    const results = await Promise.all(chunks.map((ids) => spotifyFetch(`/audio-features?ids=${ids}`)));
    return results.flatMap((r) => r?.audio_features || []);
  }, [spotifyFetch]);

  const getAllTopDataInParallel = useCallback(async (range) => {
    const [tracks, artists] = await Promise.all([
      getTopTracks(range),
      getTopArtists(range),
    ]);
    return { tracks, artists };
  }, [getTopTracks, getTopArtists]);

  const getArtistDetail = useCallback(async (artistId) => {
    return spotifyFetch(`/artists/${artistId}`);
  }, [spotifyFetch]);

  const getArtistAlbums = useCallback(async (artistId, includeGroups = 'album,single') => {
    const all = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const res = await spotifyFetch(`/artists/${artistId}/albums`, {
        include_groups: includeGroups,
        limit: 50,
        offset,
      });
      const items = res?.items || [];
      all.push(...items);
      hasMore = items.length === 50;
      offset += 50;
    }
    return all;
  }, [spotifyFetch]);

  const getArtistTopTracks = useCallback(async (artistId) => {
    return spotifyFetch(`/artists/${artistId}/top-tracks`, { market: MARKETS });
  }, [spotifyFetch]);

  const getRelatedArtists = useCallback(async (artistId) => {
    return spotifyFetch(`/artists/${artistId}/related-artists`);
  }, [spotifyFetch]);

  const searchByGenre = useCallback(async (genre) => {
    return spotifyFetch('/search', { q: `genre:${genre}`, type: 'track', limit: 20 });
  }, [spotifyFetch]);

  const getGenreRecommendations = useCallback(async (genre) => {
    return spotifyFetch('/recommendations', { seed_genres: genre, limit: 20 });
  }, [spotifyFetch]);

  const getAvailableGenreSeeds = useCallback(async () => {
    return spotifyFetch('/recommendations/available-genre-seeds');
  }, [spotifyFetch]);

  return {
    getTopTracks, getTopArtists, getRecentlyPlayed, getAudioFeatures,
    getAllTopDataInParallel, getArtistDetail, getArtistAlbums,
    getArtistTopTracks, getRelatedArtists, searchByGenre,
    getGenreRecommendations, getAvailableGenreSeeds,
    loading, error,
  };
}
