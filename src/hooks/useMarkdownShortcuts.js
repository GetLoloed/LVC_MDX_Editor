import { useState, useCallback, useEffect, useMemo } from 'react';
import { FaHeading, FaListUl, FaListOl, FaCode, FaQuoteLeft, FaLink, FaImage, FaTable, FaTasks, FaDivide } from 'react-icons/fa';

// Définition des raccourcis Markdown avec leurs remplacements, icônes et descriptions
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

// Hook pour gérer les raccourcis Markdown
export function useMarkdownShortcuts(setMarkdown) {
  // États pour gérer l'affichage et le positionnement de la bulle de suggestion
  const [showBubble, setShowBubble] = useState(false); // État pour gérer l'affichage de la bulle
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 }); // État pour stocker la position de la bulle
  const [filteredShortcuts, setFilteredShortcuts] = useState(shortcuts); // État pour stocker les raccourcis filtrés
  const [selectedIndex, setSelectedIndex] = useState(0); // État pour gérer l'index du raccourci sélectionné
  const [lastWord, setLastWord] = useState(''); // État pour stocker le dernier mot

  // Fonction pour appliquer un raccourci au texte
  const applyShortcut = useMemo(() => (text, shortcut) => {
    // Vérification des entrées
    if (!text || typeof text !== 'string' || !shortcuts[shortcut]) {
      console.error('Invalid input for applyShortcut');
      return text;
    }

    // Remplacement du dernier mot par le raccourci
    const lines = text.split('\n');
    const lastLineIndex = lines.length - 1;
    const lastLine = lines[lastLineIndex];
    const replacement = shortcuts[shortcut].replacement;
    
    lines[lastLineIndex] = lastLine.replace(shortcut, replacement); // Remplacement du dernier mot par le raccourci
    return lines.join('\n'); // Retour du texte modifié
  }, []);

  // Gestion des raccourcis et de la bulle de suggestion
  const handleShortcuts = useCallback((e) => {
    const textarea = e.target; // Récupération de la zone de texte
    const cursorPosition = textarea.selectionStart; // Position du curseur
    const textBeforeCursor = textarea.value.substring(0, cursorPosition); // Texte avant le curseur
    const currentLastWord = textBeforeCursor.split(/\s/).pop() || ''; // Dernier mot avant le curseur

    // Affichage de la bulle si le dernier mot commence par '/'
    if (currentLastWord.startsWith('/')) {
      setLastWord(currentLastWord); // Mise à jour du dernier mot
      setShowBubble(true); // Affichage de la bulle
      const rect = textarea.getBoundingClientRect(); // Récupération de la position et des dimensions de la zone de texte
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight); // Hauteur de la ligne
      const lines = textBeforeCursor.split('\n'); // Séparation du texte en lignes
      const currentLine = lines.length; // Numéro de la ligne actuelle
      setBubblePosition({
        top: rect.top + lineHeight * currentLine, // Position en hauteur
        left: rect.left + textarea.scrollLeft + getTextWidth(currentLastWord, textarea) // Position en largeur
      });

      // Filtrage des raccourcis correspondants
      const filtered = Object.entries(shortcuts).reduce((acc, [key, value]) => {
        // Filtrage des raccourcis dont le début correspond au dernier mot
        if (key.startsWith(currentLastWord)) {
          acc[key] = value; // Ajout du raccourci filtré dans l'accumulateur
        }
        return acc;
      }, {});
      setFilteredShortcuts(filtered); // Mise à jour des raccourcis filtrés
      setSelectedIndex(0); // Réinitialisation de l'index du raccourci sélectionné
    } else {
      setShowBubble(false); // Masquage de la bulle
    }

    // Gestion des touches spéciales lorsque la bulle est affichée
    if (showBubble) {
      const filteredKeys = Object.keys(filteredShortcuts); // Récupération des clés des raccourcis filtrés
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredKeys.length); // Mise à jour de l'index du raccourci sélectionné
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => (prevIndex - 1 + filteredKeys.length) % filteredKeys.length); // Mise à jour de l'index du raccourci sélectionné
          break;
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          if (filteredKeys.length > 0) {
            applySelectedShortcut(textarea, filteredKeys[selectedIndex]); // Application du raccourci sélectionné
          }
          break;
        case 'Escape':
          setShowBubble(false); // Masquage de la bulle
          break;
        default:
          // Auto-complétion si un seul raccourci correspond
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

  // Application du raccourci sélectionné
  const applySelectedShortcut = useCallback((textarea, selectedShortcut) => {
    const cursorPosition = textarea.selectionStart; // Position du curseur
    const newContent = applyShortcut(textarea.value, selectedShortcut); // Application du raccourci
    setMarkdown(newContent);
    textarea.value = newContent;
    const newCursorPosition = cursorPosition - lastWord.length + shortcuts[selectedShortcut].replacement.length; // Nouvelle position du curseur
    textarea.selectionStart = textarea.selectionEnd = newCursorPosition; // Placement du curseur
    setShowBubble(false); // Masquage de la bulle
    
    // Placement du curseur à l'intérieur des balises pour certains raccourcis
    if (['**', '*', '__', '[]', '()', '```'].some(tag => shortcuts[selectedShortcut].replacement.includes(tag))) {
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition - 1; // Placement du curseur à l'intérieur des balises
    }
  }, [applyShortcut, setMarkdown, lastWord]);

  // Insertion de texte à la position du curseur
  const insertTextAtCursor = useCallback((textarea, text) => {
    const cursorPosition = textarea.selectionStart; // Position du curseur
    const textBeforeCursor = textarea.value.substring(0, cursorPosition); // Texte avant le curseur
    const textAfterCursor = textarea.value.substring(cursorPosition); // Texte après le curseur
    const newText = textBeforeCursor + text + textAfterCursor;
    textarea.value = newText;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition + text.length; // Placement du curseur
    setMarkdown(newText); // Mise à jour du contenu
  }, [setMarkdown]);

  // Effet pour gérer le clic en dehors de la bulle
  useEffect(() => {
    const handleClickOutside = () => setShowBubble(false); // Masquage de la bulle
    document.addEventListener('click', handleClickOutside); // Ajout du gestionnaire d'événements
    return () => document.removeEventListener('click', handleClickOutside); // Suppression du gestionnaire d'événements
  }, []);

  return { handleShortcuts, showBubble, bubblePosition, filteredShortcuts, selectedIndex };
}

// Fonction utilitaire pour obtenir la largeur du texte
function getTextWidth(text, element) {
  const canvas = document.createElement('canvas'); // Création d'un canvas
  const context = canvas.getContext('2d'); // Contexte 2D du canvas
  context.font = getComputedStyle(element).font; // Récupération de la police du canvas
  return context.measureText(text).width; // Calcul de la largeur du texte
}