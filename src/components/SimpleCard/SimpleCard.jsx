import React from 'react';
import './SimpleCard.css';
import PropTypes from 'prop-types';

/**
 * SimpleCard component displays a card with an image, title, subtitle, and a link.
 * @param {*} params - Props containing imageUrl, title, subtitle, and link.
 * @returns {JSX.Element} The rendered SimpleCard component.
 */
const SimpleCard = ({ imageUrl, title, subtitle, link, linkUrl, size = 120 }) => {
  // prefer `link` (used by tests) but accept `linkUrl` as well
  const href = link || linkUrl || '#';
  return (
    <a href={href} data-testid="link" className="simple-card">
      <img
        src={imageUrl}
        alt={title}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8 }}
        className="simple-card__image"
      />
      <div className="simple-card__body">
        <h3 className="simple-card__title">{title}</h3>
        {subtitle && <p data-testid="subtitle" className="simple-card__subtitle">{subtitle}</p>}
      </div>
    </a>
  );
};

SimpleCard.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  link: PropTypes.string,
  linkUrl: PropTypes.string
};

SimpleCard.defaultProps = {
  subtitle: '',
  link: '#',
  linkUrl: undefined
};

export default SimpleCard;