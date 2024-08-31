import React, { useCallback, useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { useSelector } from 'react-redux';

const MarkdownEditor = forwardRef(({ value, onChange, onSave }, ref) => {
  const [localValue, setLocalValue] = useState(value);
  const [undoStack, setUndoStack] = useState([value]);
  const [redoStack, setRedoStack] = useState([]);
  const isUndoRedoAction = useRef(false);
  const blocks = useSelector((state) => state.blocks.blocks);
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
  }));

  useEffect(() => {
    if (!isUndoRedoAction.current) {
      setLocalValue(value);
      setUndoStack(prevStack => [...prevStack, value]);
      setRedoStack([]);
    }
    isUndoRedoAction.current = false;
  }, [value]);

  // Permet de déclencher la fonction onChange avec un délai 
  const debouncedOnChange = useCallback(
    debounce((newValue) => {
      onChange(newValue);
    }, 500),
    [onChange]
  );

  // Permet de gérer les changements de valeur dans l'éditeur
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (!isUndoRedoAction.current) {
      setUndoStack(prevStack => [...prevStack, newValue]);
      setRedoStack([]);
    }
    debouncedOnChange(newValue);
  };

  // Permet de restaurer la valeur précédente
  const handleUndo = () => {
    if (undoStack.length > 1) {
      const currentState = undoStack.pop();
      setRedoStack(prevStack => [...prevStack, currentState]);
      const previousState = undoStack[undoStack.length - 1];
      isUndoRedoAction.current = true;
      setLocalValue(previousState);
      onChange(previousState);
    }
  };

  // Permet de restaurer la valeur suivante
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack(prevStack => [...prevStack, nextState]);
      isUndoRedoAction.current = true;
      setLocalValue(nextState);
      onChange(nextState);
    }
  };

  // Permet de sauvegarder la valeur
  const handleSave = () => {
    if (onSave) {
      onSave(localValue);
    }
  };

  // Permet de gérer les raccourcis clavier
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          wrapSelection('**');
          break;
        case 'i':
          e.preventDefault();
          wrapSelection('*');
          break;
        case 'k':
          e.preventDefault();
          wrapSelection('[', '](url)');
          break;
        case '1':
          e.preventDefault();
          prefixLines('1. ');
          break;
        case '-':
          e.preventDefault();
          prefixLines('- ');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 's':
          e.preventDefault();
          handleSave();
          break;
        default:
          // Vérifier les raccourcis personnalisés des blocs
          const matchingBlock = blocks.find(block =>
            block.shortcut.ctrl === e.ctrlKey &&
            block.shortcut.alt === e.altKey &&
            block.shortcut.key.toLowerCase() === e.key.toLowerCase()
          );
          if (matchingBlock) {
            e.preventDefault();
            insertBlockContent(matchingBlock);
          }
          break;
      }
    }
  };

  // Permet de mettre en avant le texte sélectionné
  const wrapSelection = (wrapper, endWrapper = wrapper) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = localValue.substring(start, end);
    let newText;

    if (wrapper === '==') {
      // Cas spécial pour le surlignage
      newText = localValue.substring(0, start) + `${wrapper}${selectedText}${endWrapper}` + localValue.substring(end);
    } else {
      newText = localValue.substring(0, start) + wrapper + selectedText + endWrapper + localValue.substring(end);
    }

    setLocalValue(newText);
    setUndoStack(prevStack => [...prevStack, newText]);
    setRedoStack([]);
    debouncedOnChange(newText);
    setTimeout(() => {
      textareaRef.current.selectionStart = start + wrapper.length;
      textareaRef.current.selectionEnd = end + wrapper.length;
      textareaRef.current.focus();
    }, 0);
  };

  // Permet de préfixer les lignes sélectionnées
  const prefixLines = (prefix) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = localValue.substring(start, end);
    const newText = selectedText.split('\n').map(line => prefix + line).join('\n');
    const fullNewText = localValue.substring(0, start) + newText + localValue.substring(end);
    setLocalValue(fullNewText);
    setUndoStack(prevStack => [...prevStack, fullNewText]);
    setRedoStack([]);
    debouncedOnChange(fullNewText);
    setTimeout(() => {
      textareaRef.current.selectionStart = start + prefix.length;
      textareaRef.current.selectionEnd = start + newText.length;
      textareaRef.current.focus();
    }, 0);
  };

  // Permet d'insérer le contenu du bloc sélectionné
  const insertBlockContent = (block) => {
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent = localValue.substring(0, start) + block.content + localValue.substring(end);
    setLocalValue(newContent);
    setUndoStack(prevStack => [...prevStack, newContent]);
    setRedoStack([]);
    debouncedOnChange(newContent);
    setTimeout(() => {
      textareaRef.current.selectionStart = start + block.content.length;
      textareaRef.current.selectionEnd = start + block.content.length;
      textareaRef.current.focus();
    }, 0);
  };

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full p-4 bg-obsidian-bg text-obsidian-text font-mono resize-none focus:outline-none"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Écrivez votre markdown ici..."
    />
  );
});

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default MarkdownEditor;