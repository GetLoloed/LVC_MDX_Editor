import { CREATE_BLOC, EDIT_BLOC, DELETE_BLOC, RENAME_BLOC, IMPORT_BLOCS, INITIALIZE_DEFAULT_BLOCS, SAVE_BLOCS_TO_STORAGE } from '../actions/BlocActions';

const initialState = [];

const blocReducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIALIZE_DEFAULT_BLOCS:
      const savedBlocs = localStorage.getItem('blocs');
      if (state.length === 0 && !savedBlocs) {
        return action.payload;
      }
      return state;

    case CREATE_BLOC:
      if (state.some(bloc => bloc.id === action.payload.id)) {
        return state;
      }
      return [...state, action.payload];

    case EDIT_BLOC:
      return state.map(bloc => 
        bloc.id === action.payload.id 
          ? { ...bloc, content: action.payload.content }
          : bloc
      );

    case DELETE_BLOC:
      return state.filter(bloc => bloc.id !== action.payload);

    case RENAME_BLOC:
      return state.map(bloc => 
        bloc.id === action.payload.id 
          ? { ...bloc, name: action.payload.newName }
          : bloc
      );

    case IMPORT_BLOCS:
      const newBlocs = action.payload.filter(newBloc => 
        !state.some(existingBloc => existingBloc.id === newBloc.id)
      );
      return [...state, ...newBlocs];

    case SAVE_BLOCS_TO_STORAGE:
      localStorage.setItem('blocs', JSON.stringify(state));
      return state;

    default:
      return state;
  }
};

export default blocReducer;