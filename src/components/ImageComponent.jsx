import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function ImageComponent({ imageData, alt }) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (imageData) {
      // Créer un Blob à partir des données base64
      const byteCharacters = atob(imageData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Créer un objet URL à partir du Blob
      const objectUrl = URL.createObjectURL(blob);
      setImageSrc(objectUrl);

      // Nettoyer l'URL de l'objet lorsque le composant est démonté
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageData]);

  return imageSrc ? <img src={imageSrc} alt={alt} /> : null;
}

ImageComponent.propTypes = {
  imageData: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired
};

export default ImageComponent;