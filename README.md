# Spotify Visualizer

A personal Spotify Wrapped-style web app that pulls your real listening data via the Spotify Web API and displays it in a stunning, animated dashboard -- available any time of year.

![GitHub top language](https://img.shields.io/github/languages/top/Ranusha5/Spotify-Visualizer?color=61dafb)
![License](https://img.shields.io/github/license/Ranusha5/Spotify-Visualizer)

## Features

- **Login with Spotify** -- Secure OAuth 2.0 PKCE flow, no backend required
- **Top Tracks** -- Your most-played songs across 4 weeks, 6 months, and all time
- **Top Artists** -- Discover your favorite artists with album art and genres
- **Recently Played** -- See your last 50 tracks at a glance
- **Music Personality** -- AI-generated personality based on your audio features (energy, danceability, valence)
- **Era Selector** -- Toggle between short, medium, and long-term listening data
- **Smooth Animations** -- Card reveals, staggered lists, and page transitions powered by Framer Motion
- **Dark Theme** -- Sleek dark UI with Spotify green accents

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **API:** Spotify Web API (OAuth 2.0 PKCE)
- **Hosting:** Vercel / GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v18+)
- A [Spotify Developer App](https://developer.spotify.com/dashboard)

### Installation

```bash
# Clone the repo
git clone https://github.com/Ranusha5/Spotify-Visualizer.git
cd Spotify-Visualizer

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Setup Spotify OAuth

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add your redirect URI: `http://localhost:5173` (or your production URL)
4. Copy your **Client ID** and set it in `src/utils/auth.js`:

```js
const CLIENT_ID = 'your_client_id_here';
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel
```

Remember to add your production URL to the Spotify Developer Dashboard redirect URIs.

## Screenshots

*Add your screenshots here!*

## License

MIT License
