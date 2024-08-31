import { useState, useCallback, useEffect } from 'react';

// Définition des raccourcis par défaut
const defaultShortcuts = {
  'Ctrl+Z': 'undo',
  'Ctrl+Shift+Z': 'redo',
  'Ctrl+Y': 'redo',
  'Ctrl+S': 'save',
  'Ctrl+B': 'bold',
  'Ctrl+I': 'italic',
};

// Permet de gérer les raccourcis clavier
export function useShortcut(initialShortcut = { ctrl: false, alt: false, key: '' }, customHandlers = {}) {
  // État pour stocker le raccourci actuel et les erreurs éventuelles
  const [shortcut, setShortcut] = useState(initialShortcut);
  const [error, setError] = useState(null);

  // Gère la saisie d'un nouveau raccourci
  const handleShortcutKeyDown = useCallback((e) => {
    e.preventDefault();
    const newShortcut = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      key: e.key.toUpperCase(),
    };
    
    const shortcutString = formatShortcut(newShortcut);
    // Vérifie si le raccourci est déjà utilisé par défaut
    if (defaultShortcuts[shortcutString]) {
      setError(`Le raccourci ${shortcutString} est déjà utilisé par défaut pour ${defaultShortcuts[shortcutString]}`);
    } else {
      setShortcut(newShortcut);
      setError(null);
    }
  }, []);

  // Formate un raccourci en chaîne lisible
  const formatShortcut = useCallback((shortcut) => {
    if (typeof shortcut === 'string') return shortcut;
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.key) parts.push(shortcut.key);
    return parts.join(' + ') || 'Aucun';
  }, []);

  // Gère les raccourcis par défaut
  const handleDefaultShortcuts = useCallback((e) => {
    const defaultHandlers = {
      undo: () => console.log('Undo action'),
      redo: () => console.log('Redo action'),
      save: () => console.log('Save action'),
      bold: () => console.log('Bold action'),
      italic: () => console.log('Italic action'),
    };

    const handlers = { ...defaultHandlers, ...customHandlers };

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.redo();
          } else {
            handlers.undo();
          }
          break;
        case 'y':
          e.preventDefault();
          handlers.redo();
          break;
        case 's':
          e.preventDefault();
          handlers.save();
          break;
        case 'b':
          e.preventDefault();
          handlers.bold();
          break;
        case 'i':
          e.preventDefault();
          handlers.italic();
          break;
        default:
          break;
      }
    }
  }, [customHandlers]);

  // Gère les raccourcis personnalisés
  const handleCustomShortcuts = useCallback((e) => {
    const shortcutString = formatShortcut({
      ctrl: e.ctrlKey,
      alt: e.altKey,
      key: e.key.toUpperCase(),
    });

    Object.entries(customHandlers).forEach(([action, handler]) => {
      if (formatShortcut(shortcut) === shortcutString) {
        e.preventDefault();
        handler();
      }
    });
  }, [shortcut, customHandlers, formatShortcut]);

  // Effet pour ajouter et retirer l'écouteur d'événements de clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleDefaultShortcuts(e);
      handleCustomShortcuts(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDefaultShortcuts, handleCustomShortcuts]);

  // Retourne les fonctions et états nécessaires
  return {
    shortcut,
    setShortcut,
    handleShortcutKeyDown,
    formatShortcut,
    error,
  };
}