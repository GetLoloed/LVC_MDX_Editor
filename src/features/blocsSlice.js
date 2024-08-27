import { createSlice } from '@reduxjs/toolkit';

// Fonction pour charger les blocs depuis le localStorage
const loadBlocsFromLocalStorage = () => {
  try {
    const serializedBlocs = localStorage.getItem('blocs');
    if (serializedBlocs === null) {
      return [];
    }
    return JSON.parse(serializedBlocs);
  } catch (err) {
    console.error('Erreur lors du chargement des blocs depuis le localStorage:', err);
    return [];
  }
};

// Fonction pour sauvegarder les blocs dans le localStorage
const saveBlocsToLocalStorage = (blocs) => {
  try {
    const serializedBlocs = JSON.stringify(blocs);
    localStorage.setItem('blocs', serializedBlocs);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des blocs dans le localStorage:', err);
  }
};

const initialState = loadBlocsFromLocalStorage();

const blocsSlice = createSlice({
  name: 'blocs',
  initialState,
  reducers: {
    ajouterBloc: (state, action) => {
      state.push({ ...action.payload, id: Date.now() });
      saveBlocsToLocalStorage(state);
    },
    supprimerBloc: (state, action) => {
      return state.filter(bloc => bloc.id !== action.payload);
    },
    modifierBloc: (state, action) => {
      return state.map(bloc => 
        bloc.id === action.payload.id ? { ...bloc, ...action.payload } : bloc
      );
    },
    renommerBloc: (state, action) => {
      const { id, nouveauNom } = action.payload;
      return state.map(bloc => 
        bloc.id === id ? { ...bloc, nom: nouveauNom } : bloc
      );
    },
  },
});

export const { ajouterBloc, supprimerBloc, modifierBloc, renommerBloc } = blocsSlice.actions;

export default blocsSlice.reducer;