// src/components/PlayListItem.test.jsx

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals'
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayListItem from './PlayListItem';

describe('PlayListItem component', () => {
    test('renders playlist information correctly', () => {
        // Arrange
        const playlist = {
            id: 'playlist1',
            name: 'Test Playlist',
            images: [{ url: 'test.jpg' }],
            owner: { display_name: 'Test Owner' },
            tracks: { total: 15 },
            external_urls: { spotify: 'https://open.spotify.com/playlist/playlist1' }
        };
        // Act
        render(<PlayListItem playlist={playlist} />);

        // Assert
        expect(screen.getByTestId(`playlist-item-${playlist.id}`)).toBeInTheDocument();
        expect(screen.getByAltText('cover')).toHaveAttribute('src', playlist.images[0].url);
        expect(screen.getByText(playlist.name)).toBeInTheDocument();
        expect(screen.getByText(`By ${playlist.owner.display_name}`)).toBeInTheDocument();
        expect(screen.getByText(`${playlist.tracks.total} tracks`)).toBeInTheDocument();
        // only external link should have role=link
        expect(screen.getByRole('link')).toHaveAttribute('href', playlist.external_urls.spotify);
        // button for internal navigation exists and has aria-label
        expect(screen.getByRole('button', { name: `Open playlist ${playlist.name}` })).toBeInTheDocument();
    });

    describe('navigation behavior', () => {
        let originalHref;

        beforeEach(() => {
            // save original href so we can restore it after the test
            originalHref = window.location.href;
        });

        afterEach(() => {
            // restore original href
            window.location.href = originalHref;
        });

        test('navigates to playlist detail on button click', async () => {
            const playlist = { id: 'playlist1', name: 'Test Playlist', images:[{url:'test.jpg'}], owner:{display_name:'Owner'}, tracks:{total:1}, external_urls:{spotify:'https://open.spotify.com/playlist/playlist1'} };
            render(<PlayListItem playlist={playlist} />);

            const btn = screen.getByRole('button', { name: `Open playlist ${playlist.name}` });
            await userEvent.click(btn);

            // href should have been updated by the component (may be absolute in JSDOM)
            expect(window.location.href).toContain(`/playlist/${playlist.id}`);
        });

        test('navigates to playlist detail on Enter and Space keys', () => {
            const playlist = { id: 'playlist2', name: 'KeyNav Playlist', images:[{url:'a.jpg'}], owner:{display_name:'Owner'}, tracks:{total:2}, external_urls:{spotify:'https://open.spotify.com/playlist/playlist2'} };
            render(<PlayListItem playlist={playlist} />);

            const btn = screen.getByRole('button', { name: `Open playlist ${playlist.name}` });

            // Enter
            fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter', charCode: 13 });
            expect(window.location.href).toContain(`/playlist/${playlist.id}`);

            // reset href and test Space
            window.location.href = originalHref;
            fireEvent.keyDown(btn, { key: ' ', code: 'Space', charCode: 32 });
            expect(window.location.href).toContain(`/playlist/${playlist.id}`);
        });
    });

    test('renders safely when images, owner or tracks are missing', () => {
        const playlist = {
            id: 'playlist3',
            name: 'Missing Data',
            // images: undefined
            // owner: undefined
            // tracks: undefined
            external_urls: {}
        };
        render(<PlayListItem playlist={playlist} />);

        expect(screen.getByTestId(`playlist-item-${playlist.id}`)).toBeInTheDocument();
        // image element exists (alt present) even if src undefined
        expect(screen.getByAltText('cover')).toBeInTheDocument();
        // owner fallback renders the "By" label (may be empty after)
        expect(screen.getByText(/^By\s*$/)).toBeInTheDocument();
        // missing tracks should show "0 tracks"
        expect(screen.getByText('0 tracks')).toBeInTheDocument();
        // external link may not exist when external_urls empty; ensure at most one link role (external)
        const links = screen.queryAllByRole('link');
        // either 0 or 1 external link, but test should not fail due to multiple internal links
        expect(links.length).toBeLessThanOrEqual(1);
    });
});
