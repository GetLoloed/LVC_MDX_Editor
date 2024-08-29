import { useState, useCallback, useEffect, useMemo } from 'react';
import { FaHeading, FaListUl, FaListOl, FaCode, FaQuoteLeft, FaLink, FaImage, FaTable, FaTasks, FaDivide } from 'react-icons/fa';

const shortcuts = {
  '/1': { replacement: '# ', icon: FaHeading, description: 'Titre 1' },
  '/2': { replacement: '## ', icon: FaHeading, description: 'Titre 2' },
  '/3': { replacement: '### ', icon: FaHeading, description: 'Titre 3' },
  '/b': { replacement: '**Texte en gras**', icon: FaHeading, description: 'Texte en gras' },
  '/i': { replacement: '*Texte en italique*', icon: FaHeading, description: 'Texte en italique' },
  '/u': { replacement: '__Texte souligné__', icon: FaHeading, description: 'Texte souligné' },
  '/bull': { replacement: '- ', icon: FaListUl, description: 'Liste à puces' },
  '/num': { replacement: '1. ', icon: FaListOl, description: 'Liste numérotée' },
  '/todo': { replacement: '- [ ] ', icon: FaTasks, description: 'Liste de tâches' },
  '/code': { replacement: '```\n\n```', icon: FaCode, description: 'Bloc de code' },
  '/quote': { replacement: '> ', icon: FaQuoteLeft, description: 'Citation' },
  '/link': { replacement: '[Texte du lien](url)', icon: FaLink, description: 'Lien' },
  '/image': { replacement: '![Description](url)', icon: FaImage, description: 'Image' },
  '/table': { replacement: '| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|-----------|\n|           |           |           |', icon: FaTable, description: 'Tableau' },
  '/line': { replacement: '---', icon: FaDivide, description: 'Ligne horizontale' },
};

export function useMarkdownShortcuts(setMarkdown) {
  const [showBubble, setShowBubble] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 });
  const [filteredShortcuts, setFilteredShortcuts] = useState(shortcuts);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastWord, setLastWord] = useState('');

  const applyShortcut = useMemo(() => (text, shortcut) => {
    if (!text || typeof text !== 'string' || !shortcuts[shortcut]) {
      console.error('Invalid input for applyShortcut');
      return text;
    }
    const lines = text.split('\n');
    const lastLineIndex = lines.length - 1;
    const lastLine = lines[lastLineIndex];
    const replacement = shortcuts[shortcut].replacement;
    
    lines[lastLineIndex] = lastLine.replace(shortcut, replacement);
    return lines.join('\n');
  }, []);

  const handleShortcuts = useCallback((e) => {
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const currentLastWord = textBeforeCursor.split(/\s/).pop() || '';

    if (currentLastWord.startsWith('/')) {
      setLastWord(currentLastWord);
      setShowBubble(true);
      const rect = textarea.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      setBubblePosition({
        top: rect.top + lineHeight * currentLine,
        left: rect.left + textarea.scrollLeft + getTextWidth(currentLastWord, textarea)
      });

      const filtered = Object.entries(shortcuts).reduce((acc, [key, value]) => {
        if (key.startsWith(currentLastWord)) {
          acc[key] = value;
        }
        return acc;
      }, {});
      setFilteredShortcuts(filtered);
      setSelectedIndex(0);
    } else {
      setShowBubble(false);
    }

    if (showBubble) {
      const filteredKeys = Object.keys(filteredShortcuts);
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredKeys.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex - 1 + filteredKeys.length) % filteredKeys.length);
          break;
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          if (filteredKeys.length > 0) {
            applySelectedShortcut(textarea, filteredKeys[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowBubble(false);
          break;
        default:
          // Auto-complétion
          if (filteredKeys.length === 1) {
            const fullShortcut = filteredKeys[0];
            if (fullShortcut.startsWith(currentLastWord) && fullShortcut !== currentLastWord) {
              e.preventDefault();
              const completion = fullShortcut.slice(currentLastWord.length);
              insertTextAtCursor(textarea, completion);
              setLastWord(fullShortcut);
            }
          }
          break;
      }
    }
  }, [applyShortcut, setMarkdown, showBubble, filteredShortcuts, selectedIndex, lastWord]);

  const applySelectedShortcut = useCallback((textarea, selectedShortcut) => {
    const cursorPosition = textarea.selectionStart;
    const newContent = applyShortcut(textarea.value, selectedShortcut);
    setMarkdown(newContent);
    textarea.value = newContent;
    const newCursorPosition = cursorPosition - lastWord.length + shortcuts[selectedShortcut].replacement.length;
    textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
    setShowBubble(false);
    
    // Placer le curseur à l'intérieur des balises pour certains raccourcis
    if (['**', '*', '__', '[]', '()', '```'].some(tag => shortcuts[selectedShortcut].replacement.includes(tag))) {
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition - 1;
    }
  }, [applyShortcut, setMarkdown, lastWord]);

  const insertTextAtCursor = useCallback((textarea, text) => {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);
    const newText = textBeforeCursor + text + textAfterCursor;
    textarea.value = newText;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition + text.length;
    setMarkdown(newText);
  }, [setMarkdown]);

  useEffect(() => {
    const handleClickOutside = () => setShowBubble(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return { handleShortcuts, showBubble, bubblePosition, filteredShortcuts, selectedIndex };
}

function getTextWidth(text, element) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = getComputedStyle(element).font;
  return context.measureText(text).width;
}