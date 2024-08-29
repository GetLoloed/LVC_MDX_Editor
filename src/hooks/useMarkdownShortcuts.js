import { useState, useCallback, useEffect } from 'react';
import { FaHeading, FaListUl, FaCode, FaQuoteLeft, FaLink, FaImage } from 'react-icons/fa';

const shortcuts = {
  '/title': { replacement: '# ', icon: FaHeading, description: 'Titre' },
  '/subtitle': { replacement: '## ', icon: FaHeading, description: 'Sous-titre' },
  '/list': { replacement: '- ', icon: FaListUl, description: 'Liste à puces' },
  '/code': { replacement: '```\n\n```', icon: FaCode, description: 'Bloc de code' },
  '/quote': { replacement: '> ', icon: FaQuoteLeft, description: 'Citation' },
  '/link': { replacement: '[](url)', icon: FaLink, description: 'Lien' },
  '/image': { replacement: '![alt](url)', icon: FaImage, description: 'Image' },
};

export function useMarkdownShortcuts(setMarkdown) {
  const [showBubble, setShowBubble] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 });
  const [filteredShortcuts, setFilteredShortcuts] = useState(shortcuts);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const applyShortcut = useCallback((text, shortcut) => {
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
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';

    if (lastWord.startsWith('/')) {
      setShowBubble(true);
      const rect = textarea.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      setBubblePosition({
        top: rect.top + lineHeight * currentLine,
        left: rect.left + textarea.scrollLeft + getTextWidth(lastWord, textarea)
      });

      const filtered = Object.entries(shortcuts).reduce((acc, [key, value]) => {
        if (key.startsWith(lastWord)) {
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
            const selectedShortcut = filteredKeys[selectedIndex];
            const newContent = applyShortcut(textarea.value, selectedShortcut);
            setMarkdown(newContent);
            textarea.value = newContent;
            textarea.selectionStart = textarea.selectionEnd = cursorPosition - lastWord.length + shortcuts[selectedShortcut].replacement.length;
            setShowBubble(false);
          }
          break;
        case 'Escape':
          setShowBubble(false);
          break;
      }
    }
  }, [applyShortcut, setMarkdown, showBubble, filteredShortcuts, selectedIndex]);

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