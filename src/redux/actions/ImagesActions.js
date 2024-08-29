export const ajouterImage = (image) => ({
  type: 'AJOUTER_IMAGE',
  payload: image
});

export const supprimerImage = (id) => ({
  type: 'SUPPRIMER_IMAGE',
  payload: id
});

export const renommerImage = (id, nouveauNom) => ({
  type: 'RENOMMER_IMAGE',
  payload: { id, nouveauNom }
});

export const exporterImage = (image) => ({
  type: 'EXPORTER_IMAGE',
  payload: image
});

export const exporterToutesImages = () => ({
  type: 'EXPORTER_TOUTES_IMAGES'
});