import { SET_AUTO_SAVE, SET_SHOW_PREVIEW, UPDATE_UNDO_STACK, UPDATE_REDO_STACK, APPLY_UNDO_REDO } from '../actions/markdownEditorActions';

const initialState = {
  autoSave: true,
  showPreview: false,
  undoStack: [],
  redoStack: []
};

const markdownEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTO_SAVE:
      return { ...state, autoSave: action.payload };
    case SET_SHOW_PREVIEW:
      return { ...state, showPreview: action.payload };
    case UPDATE_UNDO_STACK:
      return { ...state, undoStack: [...state.undoStack, action.payload].slice(-50) }; // Limite la taille de la pile
    case UPDATE_REDO_STACK:
      return { ...state, redoStack: [...state.redoStack, action.payload].slice(-50) }; // Limite la taille de la pile
    case APPLY_UNDO_REDO:
      return { ...state, currentContent: action.payload };
    default:
      return state;
  }
};

export default markdownEditorReducer;