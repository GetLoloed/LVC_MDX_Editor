const initialState = {
  images: []
};

const imagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'AJOUTER_IMAGE':
      return {
        ...state,
        images: [...state.images, action.payload]
      };
    case 'SUPPRIMER_IMAGE':
      return {
        ...state,
        images: state.images.filter(image => image.id !== action.payload)
      };
    case 'RENOMMER_IMAGE':
      return {
        ...state,
        images: state.images.map(image => 
          image.id === action.payload.id 
            ? { ...image, nom: action.payload.nouveauNom } 
            : image
        )
      };
    default:
      return state;
  }
};

export default imagesReducer;