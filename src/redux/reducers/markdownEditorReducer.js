import { SET_AUTO_SAVE, SET_SHOW_PREVIEW, UPDATE_UNDO_STACK, UPDATE_REDO_STACK, APPLY_UNDO_REDO } from '../actions/markdownEditorActions';

// État initial du reducer
const initialState = {
  autoSave: true,        // L'auto-sauvegarde est activée par défaut
  showPreview: false,    // La prévisualisation est désactivée par défaut
  undoStack: [],         // Pile pour les actions d'annulation // TODO : à corriger
  redoStack: []          // Pile pour les actions de rétablissement // TODO : à corriger
};

// Reducer pour gérer les actions liées à l'éditeur Markdown
const markdownEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTO_SAVE:
      // Mise à jour de l'état de l'auto-sauvegarde
      return { ...state, autoSave: action.payload };
    case SET_SHOW_PREVIEW:
      // Mise à jour de l'état de la prévisualisation
      return { ...state, showPreview: action.payload };
    case UPDATE_UNDO_STACK:
      // Ajout d'un nouvel état à la pile d'annulation, en limitant sa taille à 50
      return { ...state, undoStack: [...state.undoStack, action.payload].slice(-50) };
    case UPDATE_REDO_STACK:
      // Ajout d'un nouvel état à la pile de rétablissement, en limitant sa taille à 50
      return { ...state, redoStack: [...state.redoStack, action.payload].slice(-50) };
    case APPLY_UNDO_REDO:
      // Application d'une action d'annulation ou de rétablissement
      return { ...state, currentContent: action.payload };
    default:
      // Retourne l'état actuel si l'action n'est pas reconnue
      return state;
  }
};

export default markdownEditorReducer;