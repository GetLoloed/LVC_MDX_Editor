//import produce from 'immer';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  images: [],
  selectedImage: null,
};

const bibliothequeSlice = createSlice({
  name: 'bibliotheque',
  initialState,
  reducers: {
    ajouterImage: (state, action) => {
      state.images.push(action.payload);
    },
    supprimerImage: (state, action) => {
      state.images = state.images.filter(image => image.id !== action.payload);
    },
    selectionnerImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    deselectionnerImage: (state) => {
      state.selectedImage = null;
    },
    deplacerImage: (state, action) => {
      const { sourceIndex, targetIndex } = action.payload;
      const [imageDeplacee] = state.images.splice(sourceIndex, 1);
      state.images.splice(targetIndex, 0, imageDeplacee);
    },
    renommerImage: (state, action) => {
      const { imageId, nouveauNom } = action.payload;
      const image = state.images.find(image => image.id === imageId);
      if (image) {
        image.nom = nouveauNom;
      }
    },
  },
});

export const { ajouterImage, supprimerImage, selectionnerImage, deselectionnerImage, deplacerImage, renommerImage} = bibliothequeSlice.actions;

export default bibliothequeSlice.reducer;
