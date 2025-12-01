import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyAPI } from '../services/api';

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      spotifyAPI.getToken(code)
        .then(data => {
          // Store token in localStorage or context
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
          // Redirect to desktop
          navigate('/desktop');
        })
        .catch(err => {
          console.error('Spotify Auth Error:', err);
          setError('Failed to authenticate with Spotify.');
        });
    } else {
        setError('No authorization code found.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="text-xl">Connecting to Spotify...</div>
      )}
    </div>
  );
};

export default SpotifyCallback;
