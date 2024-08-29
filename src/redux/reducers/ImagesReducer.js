// État initial du reducer
const initialState = {
  images: []
};

// Reducer pour gérer les actions liées aux images
const imagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'AJOUTER_IMAGE':
      // Ajoute une nouvelle image à la liste
      return {
        ...state,
        images: [...state.images, action.payload]
      };
    case 'SUPPRIMER_IMAGE':
      // Supprime une image de la liste en fonction de son ID
      return {
        ...state,
        images: state.images.filter(image => image.id !== action.payload)
      };
    case 'RENOMMER_IMAGE':
      // Renomme une image spécifique dans la liste
      return {
        ...state,
        images: state.images.map(image => 
          image.id === action.payload.id 
            ? { ...image, nom: action.payload.nouveauNom } 
            : image
        )
      };
    default:
      // Retourne l'état actuel si l'action n'est pas reconnue
      return state;
  }
};

// Exporte le reducer pour l'utiliser dans le store
export default imagesReducer;