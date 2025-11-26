import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [topArtist, setTopArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('spotify_access_token') : null;
    if (!token) {
      console.warn('Token Spotify introuvable. Connectez-vous pour récupérer les top artists et top tracks.');
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
        throw err;
      }
    }

    // Nouveau : récupère les top tracks et renvoie l'objet JSON
    async function fetchUserTopTracks(limit = 20) {
      try {
        const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Spotify API error ${res.status}: ${text}`);
        }
        return await res.json();
      } catch (err) {
        console.error('fetchUserTopTracks erreur:', err);
        return null;
      }
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const topArtists = await fetchUserTopArtists(10);
        console.log('topArtists (raw):', topArtists);
        if (topArtists && Array.isArray(topArtists.items) && topArtists.items.length > 0) {
          console.log('Premier artiste:', topArtists.items[0]);
          setTopArtist(topArtists.items[0]);
        } else {
          console.log('Aucun artiste top retourné.');
          setTopArtist(null);
        }

        // Appel aux top tracks et logs pour vérification
        const topTracks = await fetchUserTopTracks(10);
        console.log('topTracks (raw):', topTracks);
        if (topTracks && Array.isArray(topTracks.items) && topTracks.items.length > 0) {
          console.log('Première piste:', topTracks.items[0]);
          // si vous voulez stocker la piste dans l'état : setTopTrack(topTracks.items[0]);
        } else {
          console.log('Aucune piste top retournée.');
        }
      } catch (err) {
        setError(err?.message || 'Erreur lors de la récupération des données Spotify.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord</h1>
      <p>Page statique — vérifiez la navigation vers /dashboard.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Artiste le plus écouté</h2>

        {loading && <div>Chargement de l'artiste le plus écouté...</div>}
        {error && <div style={{ color: 'red' }}>Erreur : {error}</div>}

        {!loading && !error && topArtist && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {topArtist.images && topArtist.images[0] ? (
              <img
                src={topArtist.images[0].url}
                alt={topArtist.name}
                style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : (
              <div style={{ width: 140, height: 140, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Pas d'image
              </div>
            )}

            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{topArtist.name}</div>
              <div style={{ marginTop: 8, color: '#555' }}>
                Genres : {Array.isArray(topArtist.genres) && topArtist.genres.length > 0 ? topArtist.genres.join(', ') : 'N/A'}
              </div>
              {topArtist.external_urls?.spotify && (
                <div style={{ marginTop: 8 }}>
                  <a href={topArtist.external_urls.spotify} target="_blank" rel="noreferrer">Ouvrir sur Spotify</a>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && !topArtist && (
          <div>Aucun artiste disponible pour le moment.</div>
        )}
      </section>
    </div>
  );
}
