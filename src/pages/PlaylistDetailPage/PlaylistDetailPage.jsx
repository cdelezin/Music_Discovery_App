import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';

export default function PlaylistDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { token } = useRequireToken();

	const [playlist, setPlaylist] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => { document.title = `Playlist ${id ?? ''}`; }, [id]);

	useEffect(() => {
		if (!token || !id) return;

		fetchPlaylistById(token, id)
			.then(res => {
				if (res.error) {
					if (!handleTokenError(res.error, navigate)) {
						setError(res.error);
					}
					return;
				}
				setPlaylist(res.data);
				console.log('Fetched playlist:', res.data);

				// Example: log first track if available
				const firstTrack = res.data.tracks?.items?.[0]?.track;
				console.log('First track (if available):', firstTrack);
			})
			.catch(err => { setError(err.message); })
			.finally(() => { setLoading(false); });
	}, [token, id, navigate]);

	return (
		<section className="page-container playlist-container">
			<h1 className="page-title">Playlist</h1>
			{loading && <div>Loading playlist…</div>}
			{error && !loading && <div role="alert">{error}</div>}
			{!loading && !error && playlist && (
				<div>
					<h2>{playlist.name}</h2>
					<p>Owner: {playlist.owner?.display_name}</p>
					<p>Tracks: {playlist.tracks?.total}</p>
				</div>
			)}
			{!loading && !error && !playlist && <div>No playlist data.</div>}
		</section>
	);
}
