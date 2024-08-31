import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlocks, addBlock, deleteBlock, updateBlock } from '../store/blockSlice';
import { fetchImages } from '../store/imageSlice';
import MarkdownEditor from '../components/MarkdownEditor/MarkdownEditor';
import MarkdownPreview from '../components/MarkdownEditor/MarkdownPreview';
import Toolbar from '../components/MarkdownEditor/Toolbar';
import { AiOutlineMenu, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheck, AiOutlineSelect } from 'react-icons/ai';
import { v4 as uuidv4 } from 'uuid';
import { useSaveStatus } from '../hooks/useSaveStatus';
import { useToolbarActions } from '../hooks/useToolbarActions';
import { useShortcut } from '../hooks/useShortcut';

function BlockManager() {
  const dispatch = useDispatch();
  const { blocks, status, blockError } = useSelector((state) => state.blocks);
  const images = useSelector((state) => state.images.images);
  const currentWorkspace = useSelector((state) => state.auth.currentWorkspace);

  // États locaux pour gérer le bloc sélectionné, le contenu, le titre, etc.
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockContent, setBlockContent] = useState('');
  const [blockTitle, setBlockTitle] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Référence pour l'éditeur Markdown
  const editorRef = useRef(null);

  // Hooks pour gérer le statut de sauvegarde, les actions de la barre d'outils et les raccourcis
  const { saveStatus, showSaveStatus } = useSaveStatus();
  const handleToolbarAction = useToolbarActions(blockContent, setBlockContent, editorRef);
  const { shortcut, setShortcut, handleShortcutKeyDown, formatShortcut, error: shortcutError } = useShortcut();

  // Effet pour charger les blocs et les images lorsque l'espace de travail change
  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchBlocks(currentWorkspace.id));
      dispatch(fetchImages(currentWorkspace.id));
    }
  }, [dispatch, currentWorkspace]);

  // Gestion du changement de contenu du bloc
  const handleContentChange = (newContent) => {
    setBlockContent(newContent);
    if (selectedBlock) {
      const updatedBlock = {
        ...selectedBlock,
        content: newContent,
      };
      dispatch(updateBlock(updatedBlock))
        .then(() => {
          showSaveStatus('saved');
        })
        .catch(() => {
          showSaveStatus('error');
        });
    }
  };

  // Ajout d'un nouveau bloc
  const handleAddBlock = () => {
    const newBlock = {
      id: uuidv4(),
      title: blockTitle,
      content: blockContent,
      shortcut: shortcut,
      workspaceId: currentWorkspace.id,
    };
    dispatch(addBlock(newBlock)).then(() => {
      setSelectedBlock(newBlock);
      resetForm();
    });
  };

  // Mise à jour d'un bloc existant
  const handleUpdateBlock = () => {
    if (selectedBlock) {
      const updatedBlock = {
        ...selectedBlock,
        title: blockTitle,
        content: blockContent,
        shortcut: shortcut,
      };
      dispatch(updateBlock(updatedBlock)).then(() => {
        showSaveStatus('saved');
      });
    }
  };

  // Suppression d'un bloc
  const handleDeleteBlock = (id) => {
    dispatch(deleteBlock(id));
    resetForm();
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setSelectedBlock(null);
    setBlockContent('');
    setBlockTitle('');
    setShortcut({ ctrl: false, alt: false, key: '' });
  };

  // Sélection d'un bloc
  const handleBlockSelect = (block) => {
    setSelectedBlock(block);
    setBlockTitle(block.title);
    setBlockContent(block.content);
    setShortcut(block.shortcut);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  // Basculement de l'affichage de la barre latérale
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  // Basculement de l'affichage de l'aperçu
  const togglePreview = () => setShowPreview(!showPreview);

  // Composant pour afficher lorsqu'aucun bloc n'est sélectionné
  const NoBlockSelected = () => (
    <div className="flex flex-col items-center justify-center h-full text-obsidian-text">
      <AiOutlineSelect className="text-6xl mb-4" />
      <h2 className="text-2xl font-bold mb-2">Aucun bloc sélectionné</h2>
      <p className="mb-4 text-center">Sélectionnez un bloc dans la liste ou créez-en un nouveau.</p>
      <button
        onClick={() => setSelectedBlock({})}
        className="flex items-center px-4 py-2 bg-obsidian-accent text-obsidian-bg rounded hover:bg-opacity-80 transition-colors"
      >
        Créer un nouveau bloc
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-obsidian-bg text-obsidian-text font-sans">
      <div className="p-4 border-b border-obsidian-border">
        <div className="flex flex-wrap items-center space-x-2 space-y-2">
          <button onClick={toggleSidebar} className="md:hidden p-2 bg-obsidian-hover rounded">
            <AiOutlineMenu />
          </button>
          <input
            type="text"
            value={blockTitle}
            onChange={(e) => setBlockTitle(e.target.value)}
            placeholder="Titre du bloc"
            className="flex-grow bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-obsidian-accent min-w-[200px]"
          />
          <div className="relative">
            <input
              type="text"
              value={formatShortcut(shortcut)}
              onKeyDown={handleShortcutKeyDown}
              placeholder="Raccourci clavier"
              className="w-40 bg-obsidian-bg border border-obsidian-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-obsidian-accent"
              readOnly
            />
            <button
              onClick={() => setShortcut({ ctrl: false, alt: false, key: '' })}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-obsidian-text opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
          {shortcutError && (
            <p className="text-red-500 text-sm w-full mt-1">{shortcutError}</p>
          )}
          <button
            className="px-4 py-2 bg-obsidian-accent text-obsidian-bg hover:bg-opacity-90 rounded transition-colors duration-150 whitespace-nowrap"
            onClick={selectedBlock?.id ? handleUpdateBlock : handleAddBlock}
            disabled={!!shortcutError}
          >
            {selectedBlock?.id ? 'Mettre à jour' : 'Créer'}
          </button>
          {selectedBlock?.id && (
            <button
              className="px-4 py-2 bg-red-600 text-obsidian-bg hover:bg-opacity-90 rounded transition-colors duration-150 whitespace-nowrap"
              onClick={() => handleDeleteBlock(selectedBlock.id)}
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${showSidebar ? 'w-64' : 'w-0'} md:w-64 border-r border-obsidian-border flex flex-col transition-all duration-300 ease-in-out`}>
          <h2 className="p-4 text-xl font-bold border-b border-obsidian-border">Blocs personnalisés</h2>
          <ul className="flex-grow overflow-y-auto">
            {blocks.map((block) => (
              <li
                key={block.id}
                className={`p-3 hover:bg-obsidian-hover cursor-pointer transition-colors duration-150 ${selectedBlock?.id === block.id ? 'bg-obsidian-hover' : ''}`}
                onClick={() => handleBlockSelect(block)}
              >
                <h3 className="font-medium truncate">{block.title}</h3>
                <p className="text-xs text-obsidian-text opacity-60 truncate">
                  Raccourci : {formatShortcut(block.shortcut)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex flex-col md:flex-row relative">
          <div className={`flex-1 ${showPreview ? 'hidden' : 'flex'} md:flex md:w-1/2 flex-col`}>
            <Toolbar
              onAction={handleToolbarAction}
              blocks={blocks}
              images={images}
              onBlockSelect={handleBlockSelect}
              onImageSelect={(image) => {
                const imageMarkdown = `![${image.name}](local://${image.id})`;
                setBlockContent(prevContent => prevContent + '\n' + imageMarkdown);
              }}
            />
            {selectedBlock ? (
              <MarkdownEditor
                ref={editorRef}
                value={blockContent}
                onChange={handleContentChange}
              />
            ) : (
              <NoBlockSelected />
            )}
          </div>

          <div className={`flex-1 ${showPreview ? 'flex' : 'hidden'} md:flex md:w-1/2 overflow-auto`}>
            <MarkdownPreview markdown={blockContent} />
          </div>
        </div>
      </div>
      <button
        onClick={togglePreview}
        className="fixed bottom-4 right-4 md:hidden bg-obsidian-hover text-obsidian-text p-2 rounded-full z-10"
      >
        {showPreview ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
      </button>
      <div className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out transform ${saveStatus ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {saveStatus === 'saved' ? (
            <span className="flex items-center">
              <AiOutlineCheck className="mr-2" />
              Sauvegardé
            </span>
          ) : (
            'Erreur de sauvegarde'
          )}
        </div>
      </div>
    </div>
  );
}

export default BlockManager;