/**
 * Spotify OAuth 2.0 PKCE Flow
 * Replace CLIENT_ID with your Spotify Developer App Client ID
 */

// REPLACE THIS with your actual Client ID from Spotify Developer Dashboard
export const CLIENT_ID = 'your_client_id_here';

export const REDIRECT_URI = window.location.origin;
export const TOKEN_KEY = 'spotify_access_token';
export const REFRESH_KEY = 'spotify_refresh_token';

// Scopes needed for the visualizer
export const SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
].join(' ');

// Generate a random code verifier (used in PKCE flow)
export function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Generate challenge from verifier using SHA-256
export async function generateChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Build the authorization URL
export function getAuthUrl(codeVerifier, challenge) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: true,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange code for access token
export async function getToken(code, codeVerifier) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
    }
  }
  return data;
}

// Refresh access token
export async function refreshToken() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: CLIENT_ID,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }
  return data;
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  window.location.href = REDIRECT_URI;
}

export function getTokenFromHash() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('code');
}

export function clearHash() {
  window.history.replaceState({}, document.title, window.location.pathname);
}
