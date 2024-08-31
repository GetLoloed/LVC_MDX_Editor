import React, { useEffect, useState, useRef } from 'react';
import showdown from 'showdown';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { createRoot } from 'react-dom/client';
import ImageComponent from '../ImageComponent';

function MarkdownPreview({ markdown }) {
  const [html, setHtml] = useState('');
  const images = useSelector((state) => state.images.images);
  const containerRef = useRef(null);
  const rootsRef = useRef({});

  const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    ghCodeBlocks: true,
    emoji: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
  });

  useEffect(() => {
    const replaceImageUrls = (text) => {
      return text.replace(/!\[([^\]]*)\]\(local:\/\/([^)]+)\)/g, replaceImagePlaceholder);
    };

    const replaceImagePlaceholder = (match, alt, id) => {
      const image = images.find(img => img.id === id);
      if (image) {
        return `<div class="image-placeholder" data-image-id="${id}" data-image-alt="${alt}"></div>`;
      }
      return match;
    };

    const processedMarkdown = replaceImageUrls(markdown);
    let convertedHtml = converter.makeHtml(processedMarkdown);

    // Post-traitement pour améliorer le rendu des tableaux
    convertedHtml = convertedHtml.replace(/<table>/g, '<table class="markdown-table">');
    convertedHtml = convertedHtml.replace(/<thead>/g, '<thead class="markdown-table-header">');
    convertedHtml = convertedHtml.replace(/<tbody>/g, '<tbody class="markdown-table-body">');
    convertedHtml = convertedHtml.replace(/<tr>/g, '<tr class="markdown-table-row">');
    convertedHtml = convertedHtml.replace(/<th>/g, '<th class="markdown-table-header-cell">');
    convertedHtml = convertedHtml.replace(/<td>/g, '<td class="markdown-table-cell">');

    setHtml(convertedHtml);
  }, [markdown, images]);

  useEffect(() => {
    if (containerRef.current) {
      const placeholders = containerRef.current.querySelectorAll('.image-placeholder');
      placeholders.forEach(placeholder => {
        const id = placeholder.getAttribute('data-image-id');
        const alt = placeholder.getAttribute('data-image-alt');
        const image = images.find(img => img.id === id);
        if (image) {
          if (!rootsRef.current[id]) {
            rootsRef.current[id] = createRoot(placeholder);
          }
          rootsRef.current[id].render(<ImageComponent imageData={image.data} alt={alt} />);
        }
      });
    }

    return () => {
      Object.values(rootsRef.current).forEach(root => root.unmount());
      rootsRef.current = {};
    };
  }, [html, images]);

  return (
    <div
      ref={containerRef}
      className="prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none h-full overflow-auto p-4 bg-obsidian-bg markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

MarkdownPreview.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default MarkdownPreview;