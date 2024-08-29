import { CREATE_BLOC, EDIT_BLOC, DELETE_BLOC, RENAME_BLOC, IMPORT_BLOCS, INITIALIZE_DEFAULT_BLOCS, SAVE_BLOCS_TO_STORAGE } from '../actions/BlocActions';

// État initial du reducer
const initialState = [];

// Reducer pour gérer les actions liées aux blocs
const blocReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_DEFAULT_BLOCS:
      // Initialise les blocs par défaut si aucun bloc n'existe et qu'il n'y a pas de blocs sauvegardés
      const savedBlocs = localStorage.getItem('blocs');
      if (state.length === 0 && !savedBlocs) {
        return action.payload;
      }
      return state;

    case CREATE_BLOC:
      // Crée un nouveau bloc s'il n'existe pas déjà
      if (state.some(bloc => bloc.id === action.payload.id)) {
        return state;
      }
      return [...state, action.payload];

    case EDIT_BLOC:
      // Modifie le contenu d'un bloc existant
      return state.map(bloc => 
        bloc.id === action.payload.id 
          ? { ...bloc, content: action.payload.content }
          : bloc
      );

    case DELETE_BLOC:
      // Supprime un bloc
      return state.filter(bloc => bloc.id !== action.payload);

    case RENAME_BLOC:
      // Renomme un bloc
      return state.map(bloc => 
        bloc.id === action.payload.id 
          ? { ...bloc, name: action.payload.newName }
          : bloc
      );

    case IMPORT_BLOCS:
      // Importe de nouveaux blocs en évitant les doublons
      const newBlocs = action.payload.filter(newBloc => 
        !state.some(existingBloc => existingBloc.id === newBloc.id)
      );
      return [...state, ...newBlocs];

    case SAVE_BLOCS_TO_STORAGE:
      // Sauvegarde les blocs dans le localStorage
      localStorage.setItem('blocs', JSON.stringify(state));
      return state;

    default:
      return state;
  }
};

export default blocReducer;