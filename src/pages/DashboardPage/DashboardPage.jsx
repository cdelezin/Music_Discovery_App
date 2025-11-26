import React, { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('spotify_access_token') : null;
    if (!token) {
      console.warn('Token Spotify introuvable. Connectez-vous pour récupérer les top artists.');
      return;
    }

    async function fetchUserTopArtists(limit = 20) {
      try {
        const res = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Spotify API error ${res.status}: ${text}`);
        }
        return await res.json();
      } catch (err) {
        console.error('fetchUserTopArtists erreur:', err);
        return null;
      }
    }

    (async () => {
      const topArtists = await fetchUserTopArtists(10);
      console.log('topArtists (raw):', topArtists);
      if (topArtists && Array.isArray(topArtists.items) && topArtists.items.length > 0) {
        console.log('Premier artiste:', topArtists.items[0]);
      } else {
        console.log('Aucun artiste top retourné.');
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord</h1>
      <p>Page statique — vérifiez la navigation vers /dashboard.</p>
    </div>
  );
}
