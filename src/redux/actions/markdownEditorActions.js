export const SET_AUTO_SAVE = 'SET_AUTO_SAVE';
export const SET_SHOW_PREVIEW = 'SET_SHOW_PREVIEW';
export const UPDATE_UNDO_STACK = 'UPDATE_UNDO_STACK';
export const UPDATE_REDO_STACK = 'UPDATE_REDO_STACK';

export const setAutoSave = (autoSave) => ({ type: SET_AUTO_SAVE, payload: autoSave });
export const setShowPreview = (showPreview) => ({ type: SET_SHOW_PREVIEW, payload: showPreview });
export const updateUndoStack = (content) => ({ type: UPDATE_UNDO_STACK, payload: content });
export const updateRedoStack = (content) => ({ type: UPDATE_REDO_STACK, payload: content });

// Nouvelle action pour gérer l'annulation/rétablissement
export const APPLY_UNDO_REDO = 'APPLY_UNDO_REDO';
export const applyUndoRedo = (content) => ({ type: APPLY_UNDO_REDO, payload: content });