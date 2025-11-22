const { generateAccessToken } = require("./utils.cjs");
const { artistCountForPlaylist, artistCountForPlaylists } = require("../src/services/artist-count-for-playlist");
const { fetchPlaylistById } = require("../src/api/spotify-playlists");


async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node ./scripts/run-artist-count.cjs <playlistIdsCSV> [topN]");
    process.exit(1);
  }

  const playlistIdsCsv = args[0];
  const topN = args[1] ? parseInt(args[1], 10) : 5;

  if (!playlistIdsCsv) {
    console.error("No playlist IDs provided.");
    process.exit(1);
  }

  function normalizePlaylistId(raw) {
    if (!raw || typeof raw !== "string") return null;
    const s = raw.trim();
    // spotify open URL: https://open.spotify.com/playlist/{id}?si=...
    const openMatch = s.match(/playlist\/([^?\/]+)(?:\?|$)/i);
    if (openMatch && openMatch[1]) return openMatch[1];
    // spotify URI: spotify:playlist:{id}
    const uriMatch = s.match(/spotify:playlist:([^?\/\s]+)/i);
    if (uriMatch && uriMatch[1]) return uriMatch[1];
    // plain id
    // remove trailing query or non-alphanumeric chars
    return s.replace(/[?].*$/, "").replace(/[^a-zA-Z0-9_-].*$/, "");
  }

  const playlistIds = playlistIdsCsv
    .split(",")
    .map((s) => normalizePlaylistId(s))
    .filter(Boolean);

  try {
    const token = await generateAccessToken();
    if (!token) {
      console.error("Failed to obtain access token. Check .env.local and Spotify credentials.");
      process.exit(1);
    }

    let counts = {};
    if (playlistIds.length === 1) {
      const res = await artistCountForPlaylist(token, playlistIds[0]);
      counts = res || {};
    } else {
      const res = await artistCountForPlaylists(token, playlistIds);
      counts = res || {};
    }

    // If no counts were produced, attempt to fetch playlists directly to surface API errors.
    if (!counts || Object.keys(counts).length === 0) {
      console.error("No artist counts produced — attempting to fetch playlists to show API errors:");
      for (const id of playlistIds) {
        try {
          const res = await fetchPlaylistById(token, id);
          if (!res) {
            console.error(`Playlist ${id}: no response object`);
          } else if (res.error) {
            console.error(`Playlist ${id} error:`, res.error);
          } else if (!res.data) {
            console.error(`Playlist ${id}: returned no data`);
          } else {
            console.error(`Playlist ${id} fetched OK but no artist counts found (playlist may be empty or private).`);
          }
        } catch (e) {
          console.error(`Error fetching playlist ${id}:`, e && e.message ? e.message : e);
        }
      }
    }

    const entries = Object.entries(counts).map(([artist, count]) => ({ Artist: artist, "Number of Tracks": count }));
    entries.sort((a, b) => b["Number of Tracks"] - a["Number of Tracks"]);

    if (topN && topN > 0) {
      console.log(`Top ${topN} Artists:`);
      console.table(entries.slice(0, topN));
    } else {
      console.log("All artists:");
      console.table(entries);
    }
  } catch (err) {
    console.error("Error running artist count:", err);
    process.exit(1);
  }
}

main();
