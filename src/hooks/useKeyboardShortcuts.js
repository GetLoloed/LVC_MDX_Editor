import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUndoStack, updateRedoStack } from '../redux/actions/markdownEditorActions';
import { updateFileContent } from '../redux/actions/fileExplorerActions';

export function useKeyboardShortcuts(markdown, setMarkdown, selectedFile, textareaRef) {
  const dispatch = useDispatch();
  const undoStack = useSelector(state => state.markdownEditor.undoStack);
  const redoStack = useSelector(state => state.markdownEditor.redoStack);

  const handleSave = useCallback((e) => {
    e.preventDefault(); // Ajout de cette ligne
    if (selectedFile) {
      dispatch(updateFileContent(selectedFile, markdown));
    }
  }, [selectedFile, markdown, dispatch]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const prevContent = undoStack[undoStack.length - 1];
      dispatch(updateRedoStack([...redoStack, markdown]));
      setMarkdown(prevContent);
      dispatch(updateUndoStack(undoStack.slice(0, -1)));
    }
  }, [undoStack, redoStack, markdown, setMarkdown, dispatch]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      dispatch(updateUndoStack([...undoStack, markdown]));
      setMarkdown(nextContent);
      dispatch(updateRedoStack(redoStack.slice(0, -1)));
    }
  }, [undoStack, redoStack, markdown, setMarkdown, dispatch]);

  const insertFormatting = useCallback((start, end = '') => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const selectedText = textarea.value.substring(selectionStart, selectionEnd);
      
      const newText = textarea.value.substring(0, selectionStart) +
                      start + selectedText + end +
                      textarea.value.substring(selectionEnd);
      
      setMarkdown(newText);
      
      // Mettre à jour la position du curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selectionStart + start.length,
          selectionEnd + start.length
        );
      }, 0);
    }
  }, [markdown, setMarkdown, textareaRef]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          handleSave(e); // Passage de l'événement à handleSave
          break;
        case 'z':
          e.preventDefault();
          handleUndo();
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'b':
          e.preventDefault();
          insertFormatting('**');
          break;
        case 'i':
          e.preventDefault();
          insertFormatting('*');
          break;
        case 'k':
          e.preventDefault();
          insertFormatting('[', '](url)');
          break;
        case '`':
          e.preventDefault();
          insertFormatting('`');
          break;
        default:
          break;
      }
    }
  }, [handleSave, handleUndo, handleRedo, insertFormatting]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { handleSave, handleUndo, handleRedo, insertFormatting };
}