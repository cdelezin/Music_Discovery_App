import { useParams } from 'react-router-dom';

export default function PlaylistDetailPage() {
	const { id } = useParams();

	return <div>Playlist Page — id: {id}</div>;
}
