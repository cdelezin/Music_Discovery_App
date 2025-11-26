import React from 'react';
import './SimpleCard.css';

/**
 * SimpleCard component displays a card with an image, title, subtitle, and a link.
 * @param {*} params - Props containing imageUrl, title, subtitle, and link.
 * @returns {JSX.Element} The rendered SimpleCard component.
 */
const SimpleCard = ({ imageUrl, title, subtitle, linkUrl, linkText = 'Ouvrir sur Spotify', size = 120 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="simple-card">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8 }}
          className="simple-card__image"
        />
      ) : (
        <div style={{ width: size, height: size, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Pas d'image
        </div>
      )}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }} className="simple-card__title">{title}</div>
        {subtitle && <div style={{ color: '#666', marginTop: 6 }} data-testid="subtitle" className="simple-card__subtitle">{subtitle}</div>}
        {linkUrl && (
          <div style={{ marginTop: 8 }}>
            <a data-testid="link" href={linkUrl} target="_blank" rel="noreferrer" className="simple-card__button">
              {linkText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCard;