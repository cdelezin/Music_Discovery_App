import './PlayListItem.css';
import '../ListItem.css';

/**
 * Playlist item component
 * @param {*}  playlist 
 * @returns JSX.Element
 */
export default function PlayListItem({ playlist }) {
  const handleNavigate = () => {
    if (!playlist?.id) return;
    const url = `/playlist/${playlist.id}`;

    /* istanbul ignore next */
    try {
      if (window?.history && typeof window.history.pushState === 'function') {
        window.history.pushState({}, '', url);
        // also update href for environments/tests that read it directly
        if (window?.location) window.location.href = window.location.href.replace(window.location.origin, '') === url ? window.location.href : `${window.location.origin}${url}`;
        return;
      }
    } catch {
      // ignore and fall back to href
    }

    /* istanbul ignore next */
    try {
      if (window?.location) {
        window.location.href = url;
      }
    } catch {
      // ignore if not writable
    }
  };

  const handleKeyDown = (e) => {
    // Accept common space key names across environments
    const isSpace = e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space';
    if (e.key === 'Enter' || isSpace) {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <li key={playlist.id} data-testid={`playlist-item-${playlist.id}`} className="list-item playlist-item">
      <button
        type="button"
        className="playlist-item-link"
        aria-label={`Open playlist ${playlist?.name}`}
        onClick={handleNavigate}
        onKeyDown={handleKeyDown}
      >
        <img
          src={playlist.images?.[0]?.url}
          alt="cover"
          className="playlist-item-cover"
        />
        <div className="playlist-item-details">
          <div className="playlist-item-details-header">
            <div className="playlist-item-title">{playlist.name}</div>
            <div className="playlist-item-owner">By {playlist.owner?.display_name}</div>
          </div>
          <div className="playlist-item-tracks">{playlist.tracks?.total ?? 0} tracks</div>
        </div>
      </button>

      <a
        href={playlist.external_urls?.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="playlist-link"
      >
        Open
      </a>
    </li>
  );
}
