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
			<h1 className="page-title">Playlist</h1>
			{loading && <div>Loading playlist…</div>}
			{error && !loading && <div role="alert">{error}</div>}
			{!loading && !error && playlist && (
				<div className="playlist-detail">
					<div className="playlist-header">
						{playlist.images?.[0]?.url && (
							<img
								src={playlist.images[0].url}
								alt={playlist.name || 'Playlist cover'}
								className="playlist-cover"
							/>
						)}
						<div className="playlist-meta">
							<h2 className="playlist-title">{playlist.name}</h2>
							{playlist.description && (
								<p className="playlist-description">{playlist.description}</p>
							)}
							<p className="playlist-owner">Owner: {playlist.owner?.display_name}</p>
							<p className="playlist-tracks">Tracks: {playlist.tracks?.total}</p>
							{playlist.external_urls?.spotify && (
								<p className="playlist-link"><a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">Open in Spotify</a></p>
							)}
						</div>
					</div>

					{/* Tracks list */}
					<div className="playlist-tracks-list">
						<h3 className="tracks-title">Tracks</h3>
						{playlist.tracks?.items?.length ? (
							<ol className="track-list">
								{playlist.tracks.items
									.filter(item => item?.track) // some items may be null (local/removed)
									.map((item, idx) => {
										const track = item.track;
										const key = track.id ?? `local-${idx}`;
										return (
											<li key={key} className="track-list-item">
												<TrackItem track={track} index={idx + 1} />
											</li>
										);
									})}
							</ol>
						) : (
							<p className="no-tracks">No tracks available.</p>
						)}
					</div>
				</div>
			)}
			{!loading && !error && !playlist && <div>No playlist data.</div>}
		</section>
	);
}
