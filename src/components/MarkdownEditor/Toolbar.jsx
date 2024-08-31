import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AiOutlineBold, AiOutlineItalic, AiOutlineStrikethrough, AiOutlineOrderedList, AiOutlineUnorderedList, AiOutlineLink, AiOutlineCode, AiOutlineHighlight, AiOutlineTable, AiOutlineBlock, AiOutlinePicture, AiOutlineLeft, AiOutlineRight, AiOutlineMinus, AiOutlineAlignLeft, AiOutlineFormatPainter, AiOutlineUndo, AiOutlineRedo } from 'react-icons/ai';
import { FaHeading } from 'react-icons/fa';
import ImageComponent from '../ImageComponent';

function Toolbar({ onAction, blocks = [], images = [], onBlockSelect, onImageSelect, onUndo, onRedo }) {
  const [showBlocks, setShowBlocks] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [currentBlockPage, setCurrentBlockPage] = useState(0);
  const [currentImagePage, setCurrentImagePage] = useState(0);
  const itemsPerPage = 6;

  const tools = [
    { icon: AiOutlineUndo, action: 'undo', tooltip: 'Annuler' },
    { icon: AiOutlineRedo, action: 'redo', tooltip: 'Rétablir' },
    { icon: AiOutlineBold, action: 'bold', tooltip: 'Gras', markdown: '**' },
    { icon: AiOutlineItalic, action: 'italic', tooltip: 'Italique', markdown: '*' },
    { icon: AiOutlineStrikethrough, action: 'strikethrough', tooltip: 'Barré', markdown: '~~' },
    { icon: AiOutlineOrderedList, action: 'orderedList', tooltip: 'Liste ordonnée', markdown: '1. ' },
    { icon: AiOutlineUnorderedList, action: 'unorderedList', tooltip: 'Liste non ordonnée', markdown: '* ' },
    { icon: AiOutlineLink, action: 'link', tooltip: 'Lien', markdown: '[](url)' },
    { icon: AiOutlineCode, action: 'code', tooltip: 'Code inline', markdown: '`' },
    { icon: AiOutlineCode, action: 'codeBlock', tooltip: 'Bloc de code', markdown: '```\n\n```' },
    { icon: AiOutlineHighlight, action: 'highlight', tooltip: 'Surligner', markdown: '==' },
    { icon: AiOutlineTable, action: 'table', tooltip: 'Tableau', markdown: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |' },
    { icon: AiOutlineFormatPainter, action: 'blockquote', tooltip: 'Citation', markdown: '> ' },
    { icon: AiOutlineMinus, action: 'hr', tooltip: 'Ligne horizontale', markdown: '\n***\n' },
    { icon: FaHeading, action: 'h1', tooltip: 'Titre 1', markdown: '# ', text: '1' },
    { icon: FaHeading, action: 'h2', tooltip: 'Titre 2', markdown: '## ', text: '2' },
    { icon: FaHeading, action: 'h3', tooltip: 'Titre 3', markdown: '### ', text: '3' },
    { icon: FaHeading, action: 'h4', tooltip: 'Titre 4', markdown: '#### ', text: '4' },
    { icon: FaHeading, action: 'h5', tooltip: 'Titre 5', markdown: '##### ', text: '5' },
    { icon: FaHeading, action: 'h6', tooltip: 'Titre 6', markdown: '###### ', text: '6' },
    { icon: AiOutlineAlignLeft, action: 'paragraph', tooltip: 'Paragraphe', markdown: '\n' },
    { icon: AiOutlineBlock, action: 'toggleBlocks', tooltip: 'Blocs personnalisés' },
    { icon: AiOutlinePicture, action: 'toggleImages', tooltip: 'Images' },
  ];

  const handleAction = (action, markdown) => {
    if (action === 'toggleBlocks') {
      setShowBlocks(!showBlocks);
      setShowImages(false);
    } else if (action === 'toggleImages') {
      setShowImages(!showImages);
      setShowBlocks(false);
    } else if (action === 'undo') {
      onUndo();
    } else if (action === 'redo') {
      onRedo();
    } else {
      onAction(action, markdown);
    }
  };

  const totalBlockPages = Math.ceil(blocks.length / itemsPerPage);
  const startBlockIndex = currentBlockPage * itemsPerPage;
  const visibleBlocks = blocks.slice(startBlockIndex, startBlockIndex + itemsPerPage);

  const totalImagePages = Math.ceil(images.length / itemsPerPage);
  const startImageIndex = currentImagePage * itemsPerPage;
  const visibleImages = images.slice(startImageIndex, startImageIndex + itemsPerPage);

  const nextBlockPage = () => {
    setCurrentBlockPage((prev) => (prev + 1) % totalBlockPages);
  };

  const prevBlockPage = () => {
    setCurrentBlockPage((prev) => (prev - 1 + totalBlockPages) % totalBlockPages);
  };

  const nextImagePage = () => {
    setCurrentImagePage((prev) => (prev + 1) % totalImagePages);
  };

  const prevImagePage = () => {
    setCurrentImagePage((prev) => (prev - 1 + totalImagePages) % totalImagePages);
  };

  const formatShortcut = (shortcut) => {
    if (typeof shortcut === 'string') return shortcut;
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.key) parts.push(shortcut.key);
    return parts.join(' + ') || 'Aucun';
  };

  return (
    <div className="bg-obsidian-hover border-b border-obsidian-border">
      <div className="p-2 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            key={tool.action}
            onClick={() => handleAction(tool.action, tool.markdown)}
            className="text-obsidian-text hover:text-obsidian-accent p-1 rounded relative"
            title={tool.tooltip}
          >
            {React.createElement(tool.icon, { className: "text-xl" })}
            {tool.text && (
              <span className="absolute top-0 right-0 text-xs bg-obsidian-accent text-obsidian-bg rounded-full w-3 h-3 flex items-center justify-center">
                {tool.text}
              </span>
            )}
          </button>
        ))}
      </div>
      {showBlocks && (
        <div className="bg-obsidian-bg border-b border-obsidian-border p-2">
          <h3 className="font-bold mb-2">Blocs personnalisés</h3>
          {blocks.length > 0 ? (
            <>
              <ul className="space-y-1 mb-2">
                {visibleBlocks.map((block) => (
                  <li
                    key={block.id}
                    className="cursor-pointer hover:bg-obsidian-hover p-2 rounded flex items-center justify-between"
                    onClick={() => onBlockSelect(block)}
                  >
                    <span className="truncate">{block.title}</span>
                    <span className="text-xs text-obsidian-text opacity-60">{formatShortcut(block.shortcut)}</span>
                  </li>
                ))}
              </ul>
              {totalBlockPages > 1 && (
                <div className="flex justify-between mt-2">
                  <button
                    onClick={prevBlockPage}
                    className="p-1 bg-obsidian-hover rounded"
                  >
                    <AiOutlineLeft />
                  </button>
                  <span className="text-sm">
                    Page {currentBlockPage + 1} sur {totalBlockPages}
                  </span>
                  <button
                    onClick={nextBlockPage}
                    className="p-1 bg-obsidian-hover rounded"
                  >
                    <AiOutlineRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>
              Aucun bloc personnalisé disponible.{' '}
              <Link to="/blocks" className="text-obsidian-accent hover:underline">
                Créer un bloc
              </Link>
            </p>
          )}
        </div>
      )}
      {showImages && (
        <div className="bg-obsidian-bg border-b border-obsidian-border p-2">
          <h3 className="font-bold mb-2">Images</h3>
          {images && images.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {visibleImages.map((image) => (
                  <div
                    key={image.id}
                    className="cursor-pointer hover:bg-obsidian-hover rounded overflow-hidden shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
                    onClick={() => onImageSelect(image)}
                  >
                    <div className="h-20 w-full flex items-center justify-center overflow-hidden bg-obsidian-hover">
                      <ImageComponent imageData={image.data} alt={image.name} className="object-cover h-full w-full" />
                    </div>
                    <div className="p-2 text-center">
                      <p className="text-xs truncate">{image.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              {totalImagePages > 1 && (
                <div className="flex justify-between mt-2">
                  <button
                    onClick={prevImagePage}
                    className="p-1 bg-obsidian-hover rounded"
                  >
                    <AiOutlineLeft />
                  </button>
                  <span className="text-sm">
                    Page {currentImagePage + 1} sur {totalImagePages}
                  </span>
                  <button
                    onClick={nextImagePage}
                    className="p-1 bg-obsidian-hover rounded"
                  >
                    <AiOutlineRight />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm">
              Aucune image disponible.{' '}
              <Link to="/images" className="text-obsidian-accent hover:underline">
                Ajouter une image
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

Toolbar.propTypes = {
  onAction: PropTypes.func.isRequired,
  blocks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    shortcut: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        ctrl: PropTypes.bool,
        alt: PropTypes.bool,
        key: PropTypes.string
      })
    ])
  })),
  images: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired
  })),
  onBlockSelect: PropTypes.func.isRequired,
  onImageSelect: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired
};

export default Toolbar;