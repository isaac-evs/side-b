import React, { useState, useEffect } from 'react';

const SpotifyPlayer = ({ token, trackUri }) => {
  const [player, setPlayer] = useState(undefined);
  const [isPaused, setPaused] = useState(false);
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Side-B Desktop',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        // Automatically transfer playback to this device
        transferPlayback(token, device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state => {
        if (!state) {
            return;
        }
        setPaused(state.paused);
        setActive(true);
      }));

      player.connect();
      setPlayer(player);
    };
  }, [token]);

  // Play specific track when trackUri changes
  useEffect(() => {
    if (!player || !trackUri) return;
    
    const playTrack = async () => {
        await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [trackUri] }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
    };
    playTrack();
  }, [trackUri, player, token]);

  const transferPlayback = async (token, deviceId) => {
      await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          body: JSON.stringify({ device_ids: [deviceId], play: false }),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
      });
  }

  if (!token) return <div className="text-gray-500 text-sm">Please log in to Spotify</div>;

  return (
    <div className="p-4 bg-black text-white rounded-lg">
        <div className="text-xs text-green-400 mb-2">Spotify Connected</div>
        <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-500 rounded-full text-black font-bold text-sm hover:bg-green-400" onClick={() => { player.togglePlay() }}>
                {isPaused ? "Play" : "Pause"}
            </button>
            <button className="px-3 py-1 bg-gray-700 rounded-full text-white text-sm hover:bg-gray-600" onClick={() => { player.nextTrack() }}>
                Next
            </button>
             <button className="px-3 py-1 bg-gray-700 rounded-full text-white text-sm hover:bg-gray-600" onClick={() => { player.previousTrack() }}>
                Prev
            </button>
        </div>
    </div>
  );
};

export default SpotifyPlayer;
