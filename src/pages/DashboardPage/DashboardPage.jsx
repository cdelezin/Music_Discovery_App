/* eslint-disable no-unused-vars, no-redeclare */
import { useEffect, useState } from 'react';
import SimpleCard from '../../components/SimpleCard/SimpleCard.jsx';
import './DashboardPage.css'; 

export default function DashboardPage() {
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null); // nouvel état pour la piste
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
        // Propagate error so outer try/catch handles it consistently
        throw err;
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
          setTopTrack(topTracks.items[0]); // enregistrer la première piste
        } else {
          console.log('Aucune piste top retournée.');
          setTopTrack(null);
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

      {/* global error alert shown once when present */}
      {!loading && error && (
        <div role="alert" data-testid="dashboard-error" style={{ color: 'red', marginTop: 12 }}>
          Erreur : {error}
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Artiste le plus écouté</h2>

        {loading && <div>Chargement de l'artiste le plus écouté...</div>}

        {!loading && !error && topArtist && (
          <SimpleCard
            imageUrl={topArtist.images?.[0]?.url}
            title={topArtist.name}
            subtitle={Array.isArray(topArtist.genres) && topArtist.genres.length > 0 ? `Genres : ${topArtist.genres.join(', ')}` : 'Genres : N/A'}
            linkUrl={topArtist.external_urls?.spotify}
            size={140}
          />
        )}

        {!loading && !error && !topArtist && (
          <div>Aucun artiste disponible pour le moment.</div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Piste la plus écoutée</h2>

        {loading && <div>Chargement de la piste la plus écoutée...</div>}

        {!loading && !error && topTrack && (
          <SimpleCard
            imageUrl={topTrack.album?.images?.[0]?.url}
            title={topTrack.name}
            subtitle={Array.isArray(topTrack.artists) ? `Artiste(s) : ${topTrack.artists.map(a => a.name).join(', ')}` : 'Artiste(s) : N/A'}
            linkUrl={topTrack.external_urls?.spotify}
            size={120}
          />
        )}

        {!loading && !error && !topTrack && (
          <div>Aucune piste disponible pour le moment.</div>
        )}
      </section>
    </div>
  );
}
