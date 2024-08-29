// Action pour ajouter une nouvelle image
export const ajouterImage = (image) => ({
  type: 'AJOUTER_IMAGE',
  payload: image
});

// Action pour supprimer une image existante
export const supprimerImage = (id) => ({
  type: 'SUPPRIMER_IMAGE',
  payload: id
});

// Action pour renommer une image existante
export const renommerImage = (id, nouveauNom) => ({
  type: 'RENOMMER_IMAGE',
  payload: { id, nouveauNom }
});

// Action pour exporter une image spécifique
export const exporterImage = (image) => ({
  type: 'EXPORTER_IMAGE',
  payload: image
});

// Action pour exporter toutes les images
export const exporterToutesImages = () => ({
  type: 'EXPORTER_TOUTES_IMAGES'
});