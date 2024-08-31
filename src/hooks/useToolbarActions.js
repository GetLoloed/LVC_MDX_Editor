import { useCallback } from 'react';

// Permet de gérer les actions de la barre d'outils
export function useToolbarActions(content, setContent, editorRef) {
  // Gère les actions de la barre d'outils
  const handleToolbarAction = useCallback((action, markdownSyntax) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Récupère la sélection actuelle
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = content.substring(start, end);
    let replacement = '';

    // Applique l'action en fonction du type
    switch (action) {
      case 'bold':
      case 'italic':
      case 'strikethrough':
      case 'code':
      case 'highlight':
        // Entoure le texte sélectionné avec la syntaxe markdown
        replacement = `${markdownSyntax}${selectedText}${markdownSyntax}`;
        break;
      case 'orderedList':
      case 'unorderedList':
        // Préfixe chaque ligne avec la syntaxe de liste
        replacement = selectedText.split('\n').map(line => `${markdownSyntax}${line}`).join('\n');
        break;
      case 'link':
        // Crée un lien, utilisant le texte sélectionné comme texte du lien si disponible
        replacement = selectedText ? `[${selectedText}](url)` : `[](url)`;
        break;
      case 'table':
      case 'codeBlock':
      case 'blockquote':
      case 'hr':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'paragraph':
        // Insère un modèle de tableau ou un autre élément
        replacement = `${markdownSyntax}${selectedText}`;
        break;
      default:
        return;
    }

    // Remplace le contenu sélectionné par le nouveau contenu
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Ajuste la sélection et remet le focus sur l'éditeur
    setTimeout(() => {
      editor.selectionStart = start + markdownSyntax.length;
      editor.selectionEnd = end + markdownSyntax.length;
      editor.focus();
    }, 0);
  }, [content, setContent, editorRef]);

  return handleToolbarAction;
}