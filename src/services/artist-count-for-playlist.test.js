// src/services/artist-count-for-playlist.test.js
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import * as service from "./artist-count-for-playlist.js";

// Mock the API module that artistCountForPlaylist depends on
jest.mock("../api/spotify-playlists.js", () => ({
  fetchPlaylistById: jest.fn(),
}));


import { fetchPlaylistById } from "../api/spotify-playlists.js";

// Helper to build playlist shape
function makePlaylist(trackItems) {
  return {
    tracks: {
      items: trackItems.map((t) => ({
        track: {
          name: t.name,
          artists: (t.artists || []).map((a) => ({ name: a })),
        },
      })),
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("artistCountForPlaylist", () => {
  test("calls fetchPlaylistById with token and playlistId", async () => {
    const token = "token123";
    const playlistId = "playlistABC";
    fetchPlaylistById.mockResolvedValue({
      data: makePlaylist([
        { name: "Song 1", artists: ["Artist A"] },
        { name: "Song 2", artists: ["Artist B"] },
        { name: "Song 3", artists: ["Artist C", "Artist A"] },
      ]),
      error: null,
    });

    const result = await service.artistCountForPlaylist(token, playlistId);

    expect(fetchPlaylistById).toHaveBeenCalledTimes(1);
    expect(fetchPlaylistById).toHaveBeenCalledWith(token, playlistId);
    expect(result).toEqual({ "Artist A": 2, "Artist B": 1, "Artist C": 1 });
  });

  test("returns undefined and logs error when fetchPlaylistById rejects", async () => {
    const mockError = new Error("Network failure");
    fetchPlaylistById.mockRejectedValue(mockError);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    // First arg string, second the error object (implementation logs both)
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Error fetching playlist/);
    expect(callArgs[1]).toBe(mockError);

    consoleSpy.mockRestore();
  });

  test("returns undefined and logs when fetchPlaylistById returns falsy", async () => {
    fetchPlaylistById.mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Error fetching playlist/);
    expect(callArgs[1]).toBeUndefined();

    consoleSpy.mockRestore();
  });

  test("returns undefined and logs when fetchPlaylistById returns an error object", async () => {
    const errObj = { status: 401, message: "Unauthorized" };
    fetchPlaylistById.mockResolvedValue({ error: errObj });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Error fetching playlist/);
    expect(callArgs[1]).toBe(errObj);

    consoleSpy.mockRestore();
  });

  test("returns undefined and logs when playlist has unexpected format", async () => {
    fetchPlaylistById.mockResolvedValue({ data: {} });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Unexpected playlist format/);

    consoleSpy.mockRestore();
  });

  test("ignores invalid tracks and artist names and counts valid ones", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: {
        tracks: {
          items: [
            { track: null },
            { track: { artists: "not-array" } },
            { track: { artists: [{ name: null }, { name: "   " }, { name: "Artist X" }] } },
            { track: { artists: [{ name: "Artist X" }] } },
          ],
        },
      },
      error: null,
    });

    const result = await service.artistCountForPlaylist("t", "p");
    expect(result).toEqual({ "Artist X": 2 });
  });
});

  test("returns undefined and logs when playlistIds is not an array", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylists("t", "not-an-array");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/playlistIds doit être un tableau/);

    consoleSpy.mockRestore();
  });

  test("aggregates counts across playlists and continues on errors", async () => {
    // p1 -> returns two tracks (A x1, B x2)
    fetchPlaylistById.mockImplementationOnce(async (token, id) => ({
      data: makePlaylist([
        { name: "s1", artists: ["A"] },
        { name: "s2", artists: ["B", "B"] },
      ]),
      error: null,
    }));
    // p2 -> simulate API failure
    fetchPlaylistById.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    // p3 -> returns (A x2, C x1)
    fetchPlaylistById.mockImplementationOnce(async () => ({
      data: makePlaylist([
        { name: "s3", artists: ["A"] },
        { name: "s4", artists: ["A", "C"] },
      ]),
      error: null,
    }));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await service.artistCountForPlaylists("t", ["p1", "p2", "p3"]);
    expect(result).toEqual({ A: 3, B: 2, C: 1 });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
