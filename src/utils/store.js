import { configureStore } from '@reduxjs/toolkit';

// Définition d'un reducer initial (à remplacer par vos propres reducers)
const initialReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Configuration du store
const store = configureStore({
  reducer: {
    initial: initialReducer,
    // Ajoutez d'autres reducers ici
  },
});

export default store;
