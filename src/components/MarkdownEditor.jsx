import React, { useState, useEffect } from 'react';
import MarkdownPreview from './MarkdownPreview';
import CustomBlock from './CustomBlock';

const MarkdownEditor = ({ content, onContentChange, customBlocks, onCustomBlocksChange }) => {
  const [localContent, setLocalContent] = useState(content);
  const [showCustomBlocks, setShowCustomBlocks] = useState(false);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const handleAddCustomBlock = () => {
    const newBlock = {
      id: Date.now(),
      content: '# Nouveau bloc personnalisé\n\nContenu du bloc...'
    };
    onCustomBlocksChange([...customBlocks, newBlock]);
  };

  const handleSaveCustomBlock = (updatedBlock) => {
    const updatedBlocks = customBlocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    onCustomBlocksChange(updatedBlocks);
  };

  const handleDeleteCustomBlock = (blockId) => {
    const updatedBlocks = customBlocks.filter(block => block.id !== blockId);
    onCustomBlocksChange(updatedBlocks);
  };

  const insertCustomBlock = (blockContent) => {
    const cursorPosition = document.getElementById('markdown-textarea').selectionStart;
    const updatedContent =
      localContent.slice(0, cursorPosition) +
      blockContent +
      localContent.slice(cursorPosition);
    setLocalContent(updatedContent);
    onContentChange(updatedContent);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-2">
        <button
          onClick={() => setShowCustomBlocks(!showCustomBlocks)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          {showCustomBlocks ? 'Masquer' : 'Afficher'} les blocs personnalisés
        </button>
        <button
          onClick={handleAddCustomBlock}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Ajouter un bloc personnalisé
        </button>
      </div>
      {showCustomBlocks && (
        <div className="mb-4 max-h-40 overflow-y-auto">
          {customBlocks.map(block => (
            <div key={block.id} className="flex items-center mb-2">
              <CustomBlock
                block={block}
                onSave={handleSaveCustomBlock}
                onDelete={handleDeleteCustomBlock}
              />
              <button
                onClick={() => insertCustomBlock(block.content)}
                className="ml-2 bg-purple-500 text-white px-2 py-1 rounded"
              >
                Insérer
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex-grow flex">
        <textarea
          id="markdown-textarea"
          className="w-1/2 p-2 border rounded resize-none font-mono"
          value={localContent}
          onChange={handleChange}
          placeholder="Écrivez votre contenu Markdown ici..."
        />
        <div className="w-1/2 p-2 border-l">
          <MarkdownPreview content={localContent} />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;