// src/pages/PlaylistsPage.test.jsx

import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
// mock the spotify API module to avoid import timing issues
jest.mock('../../api/spotify-playlists.js', () => ({ fetchPlaylistById: jest.fn() }));
const spotifyApi = jest.requireMock('../../api/spotify-playlists.js');

import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys.js';
// removed static import of PlaylistDetailPage

const playlistData = {
    id: 'playlist1',
    name: 'My Playlist 1',
    description: 'A cool playlist',
    images: [{ url: 'https://via.placeholder.com/56' }],
    owner: { display_name: 'User1' },
    external_urls: { spotify: 'https://open.spotify.com/playlist/playlist1' },
    tracks: {
        items: [
            {
                track: {
                    id: 'track1',
                    name: 'Track One',
                    artists: [{ name: 'Artist A' }],
                    album: { name: 'Album X', images: [{ url: 'https://via.placeholder.com/56' }] },
                    duration_ms: 210000,
                    external_urls: { spotify: 'https://open.spotify.com/track/track1' },
                },
            },
        ],
    },
    total: 5,
};

describe('PlaylistPage', () => {
    beforeEach(() => {
        const tokenValue = 'test-token';
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => key === KEY_ACCESS_TOKEN ? tokenValue : null);
        // use the mocked function — include both playlist and data to satisfy different response shapes
        spotifyApi.fetchPlaylistById.mockResolvedValue({ playlist: playlistData, data: playlistData, error: null });
    });

    afterEach(() => {
        // restore spies and reset jest.fn mocks to avoid cross-test pollution
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test('fetches and renders playlist, sets title', async () => {
        // import the component after mocks are set so the mocked API is used by the component
        const { default: PlaylistDetailPage } = await import('./PlaylistDetailPage.jsx');

        render(
            <MemoryRouter initialEntries={['/playlist/playlist1']}>
                <Routes>
                    <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(document.title).toBe('Playlist playlist1');
        
        // wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        // verify playlist content rendered
        const heading = await screen.findByRole('heading', { level: 1, name: playlistData.name });
        expect(heading).toBeInTheDocument();

        const img = screen.getByAltText(`Cover of ${playlistData.name}`);
        expect(img).toHaveAttribute('src', playlistData.images[0].url); 

        const description = await screen.findByRole('heading', { level: 2, name: playlistData.description });
        expect(description).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /spotify/i });
        expect(link).toHaveAttribute('href', playlistData.external_urls.spotify);
        expect(link).toHaveTextContent(/open in spotify/i);

        for (const track of playlistData.tracks.items) {
            expect(await screen.findByTestId(`track-item-${track.track.id}`)).toBeInTheDocument();
        }

        // split assertions into separate waitFor calls to satisfy lint rules
        await waitFor(() => expect(spotifyApi.fetchPlaylistById).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(spotifyApi.fetchPlaylistById).toHaveBeenCalledWith('test-token', 'playlist1'));
    });

    test('displays error message on fetch failure', async () => {
        spotifyApi.fetchPlaylistById.mockResolvedValue({ playlist: null, error: 'Failed to fetch playlist' });

        const { default: PlaylistDetailPage } = await import('./PlaylistDetailPage.jsx');

        render(
            <MemoryRouter initialEntries={['/playlist/playlist1']}>
                <Routes>
                    <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Failed to fetch playlist');
    });

    test('displays error message on fetchPlaylistById failure', async () => {
        spotifyApi.fetchPlaylistById.mockRejectedValue(new Error('API error occurred'));

        const { default: PlaylistDetailPage } = await import('./PlaylistDetailPage.jsx');

        render(
            <MemoryRouter initialEntries={['/playlist/playlist1']}>
                <Routes>
                    <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('API error occurred');
    });

    // test("handleTokenError called on token expiry error", async () => {
    //     const handleTokenErrorSpy = jest.spyOn(require('../../utils/handleTokenError.js'), 'handleTokenError');
    //     jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({ playlist: null, error: 'The access token expired' });

    //     render(
    //         <MemoryRouter initialEntries={['/playlist/playlist1']}>
    //             <Routes>
    //                 <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
    //                 {/* Dummy login route for redirection when token is expired */}
    //                 <Route path="/login" element={<div>Login Page</div>} />
    //             </Routes>
    //         </MemoryRouter>
    //     );

    //     // wait for loading to finish
    //     await waitFor(() => {
    //         expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    //     });

    //     expect(handleTokenErrorSpy).toHaveBeenCalledWith('The access token expired', expect.any(Function));
    // });
});