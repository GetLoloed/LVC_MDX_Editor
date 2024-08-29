export const CREATE_FOLDER = 'CREATE_FOLDER';
export const CREATE_FILE = 'CREATE_FILE';
export const RENAME_ITEM = 'RENAME_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';
export const MOVE_ITEM = 'MOVE_ITEM';
export const SELECT_FILE = 'SELECT_FILE';
export const UPDATE_FILE_CONTENT = 'UPDATE_FILE_CONTENT';

// Action pour créer un nouveau dossier
export const createFolder = (path, name) => ({
  type: CREATE_FOLDER,
  payload: { path, name }
});

// Action pour créer un nouveau fichier
export const createFile = (path, name, content = '') => ({
  type: CREATE_FILE,
  payload: { path, name, content }
});

// Action pour renommer un élément (fichier ou dossier)
export const renameItem = (path, newName) => ({
  type: RENAME_ITEM,
  payload: { path, newName }
});

// Action pour supprimer un élément (fichier ou dossier)
export const deleteItem = (path) => ({
  type: DELETE_ITEM,
  payload: { path }
});

// Action pour déplacer un élément
export const moveItem = (sourcePath, targetPath) => {
  console.log('moveItem action called:', { sourcePath, targetPath });
  return {
    type: MOVE_ITEM,
    payload: { sourcePath, targetPath }
  };
};

// Action pour sélectionner un fichier
export const selectFile = (path, content) => ({
  type: SELECT_FILE,
  payload: { path, content }
});

// Action pour mettre à jour le contenu d'un fichier
export const updateFileContent = (path, content) => ({
  type: UPDATE_FILE_CONTENT,
  payload: { path, content }
});

// Action pour mettre à jour la pile d'annulation
export const updateUndoStack = (content) => ({
  type: 'UPDATE_UNDO_STACK',
  payload: content
});

// Action pour mettre à jour la pile de rétablissement
export const updateRedoStack = (content) => ({
  type: 'UPDATE_REDO_STACK',
  payload: content
});

export const APPLY_UNDO_REDO = 'APPLY_UNDO_REDO';

// Action pour appliquer une annulation ou un rétablissement
export const applyUndoRedo = (content) => ({
  type: APPLY_UNDO_REDO,
  payload: content
});

export const SEARCH_FILES = 'SEARCH_FILES';
export const SORT_FILES = 'SORT_FILES';
export const FILTER_FILES = 'FILTER_FILES';

// Action pour rechercher des fichiers
export const searchFiles = (searchTerm) => ({
  type: SEARCH_FILES,
  payload: searchTerm
});

// Action pour trier les fichiers
export const sortFiles = (criteria) => ({
  type: SORT_FILES,
  payload: criteria
});

// Action pour filtrer les fichiers
export const filterFiles = (filterType) => ({
  type: FILTER_FILES,
  payload: filterType
});

export const IMPORT_FILE = 'IMPORT_FILE';

// Action pour importer un fichier
export const importFile = (fileName, content) => ({
  type: IMPORT_FILE,
  payload: { fileName, content }
});

export const CHECK_FILE_EXISTS = 'CHECK_FILE_EXISTS';

// Action pour vérifier si un fichier existe
export const checkFileExists = (path) => ({
  type: CHECK_FILE_EXISTS,
  payload: { path }
});

export const SET_SELECTED_FILE = 'SET_SELECTED_FILE';

// Action pour définir le fichier sélectionné
export const setSelectedFile = (path) => ({
  type: SET_SELECTED_FILE,
  payload: path
});