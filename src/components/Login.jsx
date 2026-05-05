import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateCodeVerifier, generateChallenge, getAuthUrl, SCOPES, CLIENT_ID } from '../utils/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const codeVerifier = generateCodeVerifier();
      const challenge = await generateChallenge(codeVerifier);

      localStorage.setItem('spotify_code_verifier', codeVerifier);
      localStorage.setItem('spotify_code_challenge', challenge);

      const authUrl = getAuthUrl(codeVerifier, challenge);
      window.location.href = authUrl;
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-spotify/20 via-background to-background opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      />

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-spotify/10 blur-3xl"
          style={{
            width: 400 + i * 150,
            height: 400 + i * 150,
            top: `${20 + i * 15}%`,
            left: `${10 - i * 5}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="w-20 h-20 bg-spotify rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow">
          <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424c-.18.295-.564.387-.858.207-2.35-1.434-5.308-1.758-8.793-.96-.337.077-.673-.134-.75-.471s.134-.674.471-.751c3.805-.87 7.066-.493 9.722 1.117.295.18.387.564.208.858zm1.224-2.726c-.223.365-.698.477-1.063.254-2.686-1.652-6.78-2.123-9.906-1.147-.409.128-.844-.102-.972-.51-.128-.41.102-.843.512-.97 3.583-1.12 8.12-.592 11.175 1.31.365.225.478.701.254 1.063zm.116-2.821c-3.198-1.897-8.48-2.072-11.56-1.11-.516.161-1.066-.129-1.227-.645-.162-.517.128-1.067.645-1.228 3.536-1.104 9.33-.899 13.002 1.278.462.274.613.87.339 1.333-.275.462-.87.613-1.334.339z"/>
          </svg>
        </div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white text-center mb-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your Spotify,
          <br />
          Visualized.
        </motion.h1>

        <motion.p
          className="text-textSubtle text-center mb-8 text-lg"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          See your listening habits come to life with beautiful
          charts, your music personality, and more.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4"
        >
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-spotify w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            )}
            {loading ? 'Connecting...' : 'Login with Spotify'}
          </button>

          <p className="text-xs text-textSubtle/60 text-center">
            Secure OAuth 2.0 PKCE -- your data never leaves your browser
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-spotify">4</div>
          <div className="text-xs text-textSubtle">Sections</div>
        </div>
        <div className="w-px h-10 bg-textSubtle/20" />
        <div className="text-center">
          <div className="text-2xl font-bold text-spotify">3</div>
          <div className="text-xs text-textSubtle">Time Ranges</div>
        </div>
        <div className="w-px h-10 bg-textSubtle/20" />
        <div className="text-center">
          <div className="text-2xl font-bold text-spotify">0</div>
          <div className="text-xs text-textSubtle">Server Needed</div>
        </div>
      </motion.div>
    </div>
  );
}
