import { useMemo } from 'react';
import showdown from 'showdown';

export function useMarkdownConverter(markdown, images, blocs) {
  const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    simpleLineBreaks: true,
  });

  // Fonction pour remplacer les raccourcis de bloc et d'image
  const replaceShortcuts = (text) => {
    if (typeof text !== 'string') {
      console.error('Le texte à convertir n\'est pas une chaîne de caractères:', text);
      return '';
    }

    // Remplacer les raccourcis de bloc
    const blocRegex = /<bloc-shortcut id="(\d+)" \/>/g;
    text = text.replace(blocRegex, (match, blocId) => {
      const bloc = blocs.find(b => b.id === parseInt(blocId));
      return bloc ? bloc.content : match;
    });

    // Remplacer les raccourcis d'image
    const imageRegex = /<img-shortcut id="(\d+)" alt="([^"]*)" \/>/g;
    text = text.replace(imageRegex, (match, imageId, alt) => {
      const image = images.find(img => img.id === imageId);
      if (image) {
        return `![${alt}](data:image/jpeg;base64,${image.data})`;
      }
      return match;
    });

    return text;
  };

  // Convertir le markdown en HTML
  const html = useMemo(() => {
    if (typeof markdown !== 'string') {
      console.error('Le markdown à convertir n\'est pas une chaîne de caractères:', markdown);
      return '';
    }
    const processedMarkdown = replaceShortcuts(markdown);
    return converter.makeHtml(processedMarkdown);
  }, [markdown, images, blocs]);

  return html;
}