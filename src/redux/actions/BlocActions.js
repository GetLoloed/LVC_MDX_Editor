import { v4 as uuidv4 } from 'uuid';

// Types d'actions
export const CREATE_BLOC = 'CREATE_BLOC';
export const EDIT_BLOC = 'EDIT_BLOC';
export const DELETE_BLOC = 'DELETE_BLOC';
export const RENAME_BLOC = 'RENAME_BLOC';
export const IMPORT_BLOCS = 'IMPORT_BLOCS';
export const INITIALIZE_DEFAULT_BLOCS = 'INITIALIZE_DEFAULT_BLOCS';
export const SAVE_BLOCS_TO_STORAGE = 'SAVE_BLOCS_TO_STORAGE';

// Créateurs d'actions
export const createBloc = (name = 'Nouveau bloc', content = '') => ({
  type: CREATE_BLOC,
  payload: {
    id: uuidv4(),
    name,
    content
  }
});

export const editBloc = (id, content) => ({
  type: EDIT_BLOC,
  payload: { id, content }
});

export const deleteBloc = (id) => ({
  type: DELETE_BLOC,
  payload: id
});

export const renameBloc = (id, newName) => ({
  type: RENAME_BLOC,
  payload: { id, newName }
});

export const importBlocs = (blocs) => ({
  type: IMPORT_BLOCS,
  payload: blocs
});

export const initializeDefaultBlocs = () => {
  const defaultBlocs = [
    { id: uuidv4(), name: 'Introduction', content: 'Ceci est une introduction par défaut.' },
    { id: uuidv4(), name: 'Développement', content: 'Ceci est le corps principal du texte.' },
    { id: uuidv4(), name: 'Conclusion', content: 'Ceci est une conclusion par défaut.' },
    { id: uuidv4(), name: 'Citation', content: '> Ceci est un exemple de citation. Remplacez-la par votre propre citation.' },
    { id: uuidv4(), name: 'Liste à puces', content: '- Premier élément\n- Deuxième élément\n- Troisième élément' }
  ];

  return {
    type: INITIALIZE_DEFAULT_BLOCS,
    payload: defaultBlocs
  };
};

export const saveBlocsToStorage = () => ({
  type: SAVE_BLOCS_TO_STORAGE
});

// Action thunk pour initialiser les blocs
export const initializeBlocsIfNeeded = () => (dispatch, getState) => {
  const currentState = getState().blocs;
  const savedBlocs = localStorage.getItem('blocs');

  if (currentState.length === 0 && !savedBlocs) {
    dispatch(initializeDefaultBlocs());
  } else if (savedBlocs) {
    dispatch(importBlocs(JSON.parse(savedBlocs)));
  }
};