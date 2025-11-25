import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';

export default function PlaylistDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { token } = useRequireToken();

	const [playlist, setPlaylist] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => { document.title = `Playlist ${id ?? ''}`; }, [id]);

	useEffect(() => {
		if (playlist?.name) {
			document.title = playlist.name;
		}
	}, [playlist]);

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
			{/* show playlist name as main h1 when available, fallback to "Playlist" */}
			<h1 className="page-title">{playlist?.name ?? 'Playlist'}</h1>
			{loading && <div>Loading playlist…</div>}
			{error && !loading && <div role="alert">{error}</div>}
			{!loading && !error && playlist && (
				<div className="playlist-detail">
					<div className="playlist-header">
						{/* make alt match tests */}
						<img
							className="playlist-cover"
							src={playlist?.images?.[0]?.url}
							alt={playlist ? `Cover of ${playlist.name}` : 'cover'}
						/>
						<div className="playlist-meta">
							{/* keep a subheading for description as h2 to match tests */}
							{playlist && <p className="playlist-owner">Owner: {playlist.owner?.display_name}</p>}
							{playlist && <h2 className="playlist-description">{playlist.description}</h2>}
							{/* if needed keep name elsewhere or rely on main h1 above */}
							<p className="playlist-tracks">Tracks: {playlist?.total}</p>
							<p className="playlist-link">
								<a href={playlist?.external_urls?.spotify} target="_blank" rel="noopener noreferrer">Open in Spotify</a>
							</p>
						</div>
					</div>
					<div className="playlist-tracks-list">
						<h3 className="tracks-title">Tracks</h3>
						<ol className="track-list">
							{/* TrackItem itself renders an <li>, so render it directly to avoid nested <li> */}
							{playlist?.tracks?.items?.map((item, idx) => (
								<TrackItem key={item.track.id} track={item.track} index={idx + 1} />
							))}
						</ol>
					</div>
				</div>
			)}
			{!loading && !error && !playlist && <div>No playlist data.</div>}
		</section>
	);
}
