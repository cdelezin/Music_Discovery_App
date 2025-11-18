import { fetchPlaylistById } from "../api/spotify-playlists.js";

/**
 * Compte le nombre d'apparitions de chaque artiste dans une playlist Spotify.
 *
 * @param {string} token - Token d'accès Spotify
 * @param {string} playlistId - ID de la playlist
 * @returns {Promise<Object|undefined>} - Objet { artistName: count } ou undefined en cas d'erreur
 */
export async function artistCountForPlaylist(token, playlistId) {
  try {
    const result = await fetchPlaylistById(token, playlistId);

    if (!result) {
      console.error("Error fetching playlist", undefined);
      return undefined;
    }

    if (result.error) {
      console.error("Error fetching playlist", result.error);
      return undefined;
    }

    const playlist = result.data;

    if (!playlist?.tracks?.items) {
      console.error("Unexpected playlist format", playlist);
      return undefined;
    }

    const artistCounts = {};

    for (const item of playlist.tracks.items) {
      const track = item?.track;
      if (!track || !Array.isArray(track.artists)) continue;

      for (const artist of track.artists) {
        const rawName = artist?.name;
        const name = typeof rawName === "string" ? rawName.trim() : "";
        if (!name) continue;

        artistCounts[name] = (artistCounts[name] || 0) + 1;
      }
    }

    return artistCounts;
  } catch (error) {
    console.error("Error fetching playlist", error);
    return undefined;
  }
}

/**
 * Agrège les comptes d'artistes sur plusieurs playlists.
 *
 * @param {string} token - Token d'accès Spotify
 * @param {string[]} playlistIds - Tableau d'IDs de playlists
 * @returns {Promise<Object|undefined>} - Objet { artistName: count } ou undefined en cas d'erreur
 */
export async function artistCountForPlaylists(token, playlistIds) {
  if (!Array.isArray(playlistIds)) {
    console.error("playlistIds doit être un tableau d'IDs de playlists");
    return undefined;
  }

  const aggregated = {};

  for (const id of playlistIds) {
    try {
      const counts = await artistCountForPlaylist(token, id);
      if (!counts) continue;

      for (const [artist, cnt] of Object.entries(counts)) {
        aggregated[artist] = (aggregated[artist] || 0) + cnt;
      }
    } catch (err) {
      console.error("Error counting playlist", id, err);
      // continue with next playlist
    }
  }

  return aggregated;
}