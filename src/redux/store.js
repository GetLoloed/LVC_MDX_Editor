import { configureStore } from '@reduxjs/toolkit';
import imagesReducer from './reducers/imagesReducer';
import localStorageMiddleware from './middleware/localStorageMiddleware';
import blocReducer from './reducers/BlocReducer';
import fileExplorerReducer from './reducers/fileExplorerReducer';
import markdownEditorReducer from './reducers/markdownEditorReducer';

// Fonction pour charger l'état depuis le localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Chargement de l'état initial
const preloadedState = loadState();

// Configuration du store Redux
const store = configureStore({
  // Combinaison des reducers
  reducer: {
    images: imagesReducer,
    blocs: blocReducer,
    fileExplorer: fileExplorerReducer,
    markdownEditor: markdownEditorReducer,
  },
  // Utilisation de l'état préchargé
  preloadedState,
  // Configuration des middlewares
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export default store;