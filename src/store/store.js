import { configureStore } from '@reduxjs/toolkit';
import fileSystemReducer from './fileSystemSlice';
import imageReducer from './imageSlice';
import blockReducer from './blockSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    fileSystem: fileSystemReducer, // Reducer pour le système de fichiers
    images: imageReducer, // Reducer pour les images
    blocks: blockReducer, // Reducer pour les blocs
    auth: authReducer, // Reducer pour l'authentification
  },
});