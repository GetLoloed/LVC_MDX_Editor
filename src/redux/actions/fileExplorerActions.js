export const CREATE_FOLDER = 'CREATE_FOLDER';
export const CREATE_FILE = 'CREATE_FILE';
export const RENAME_ITEM = 'RENAME_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';
export const MOVE_ITEM = 'MOVE_ITEM';
export const SELECT_FILE = 'SELECT_FILE';
export const UPDATE_FILE_CONTENT = 'UPDATE_FILE_CONTENT';

export const createFolder = (path, name) => ({
  type: CREATE_FOLDER,
  payload: { path, name }
});

export const createFile = (path, name, content = '') => ({
  type: CREATE_FILE,
  payload: { path, name, content }
});

export const renameItem = (path, newName) => ({
  type: RENAME_ITEM,
  payload: { path, newName }
});

export const deleteItem = (path) => ({
  type: DELETE_ITEM,
  payload: { path }
});

export const moveItem = (sourcePath, targetPath) => {
  console.log('moveItem action called:', { sourcePath, targetPath });
  return {
    type: MOVE_ITEM,
    payload: { sourcePath, targetPath }
  };
};

export const selectFile = (path, content) => ({
  type: SELECT_FILE,
  payload: { path, content }
});

export const updateFileContent = (path, content) => ({
  type: UPDATE_FILE_CONTENT,
  payload: { path, content }
});

export const updateUndoStack = (content) => ({
  type: 'UPDATE_UNDO_STACK',
  payload: content
});

export const updateRedoStack = (content) => ({
  type: 'UPDATE_REDO_STACK',
  payload: content
});

export const SEARCH_FILES = 'SEARCH_FILES';
export const SORT_FILES = 'SORT_FILES';
export const FILTER_FILES = 'FILTER_FILES';

export const searchFiles = (searchTerm) => ({
  type: SEARCH_FILES,
  payload: searchTerm
});

export const sortFiles = (criteria) => ({
  type: SORT_FILES,
  payload: criteria
});

export const filterFiles = (filterType) => ({
  type: FILTER_FILES,
  payload: filterType
});

export const IMPORT_FILE = 'IMPORT_FILE';

export const importFile = (fileName, content) => ({
  type: IMPORT_FILE,
  payload: { fileName, content }
});

export const CHECK_FILE_EXISTS = 'CHECK_FILE_EXISTS';

export const checkFileExists = (path) => ({
  type: CHECK_FILE_EXISTS,
  payload: { path }
});

export const SET_SELECTED_FILE = 'SET_SELECTED_FILE';

export const setSelectedFile = (path) => ({
  type: SET_SELECTED_FILE,
  payload: path
});