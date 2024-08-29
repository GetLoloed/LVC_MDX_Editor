export const SET_AUTO_SAVE = 'SET_AUTO_SAVE';
export const SET_SHOW_PREVIEW = 'SET_SHOW_PREVIEW';
export const UPDATE_UNDO_STACK = 'UPDATE_UNDO_STACK';
export const UPDATE_REDO_STACK = 'UPDATE_REDO_STACK';

// Action pour gérer l'auto-sauvegarde
export const setAutoSave = (autoSave) => ({ type: SET_AUTO_SAVE, payload: autoSave });

// Action pour gérer l'affichage de la prévisualisation
export const setShowPreview = (showPreview) => ({ type: SET_SHOW_PREVIEW, payload: showPreview });

// Action pour gérer l'annulation/rétablissement
export const updateUndoStack = (content) => ({ type: UPDATE_UNDO_STACK, payload: content });

// Action pour gérer le rétablissement
export const updateRedoStack = (content) => ({ type: UPDATE_REDO_STACK, payload: content });

// Action pour gérer l'annulation/rétablissement
export const APPLY_UNDO_REDO = 'APPLY_UNDO_REDO';
export const applyUndoRedo = (content) => ({ type: APPLY_UNDO_REDO, payload: content });