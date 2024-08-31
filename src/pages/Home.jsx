import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheck, AiOutlineFileAdd, AiOutlineSelect } from 'react-icons/ai';
import MarkdownEditor from '../components/MarkdownEditor/MarkdownEditor';
import MarkdownPreview from '../components/MarkdownEditor/MarkdownPreview';
import FileExplorer from '../components/FileExplorer/FileExplorer';
import Toolbar from '../components/MarkdownEditor/Toolbar';
import { updateFile, addFile, fetchFileSystem } from '../store/fileSystemSlice';
import { v4 as uuidv4 } from 'uuid';
import { fetchImages } from '../store/imageSlice';
import { fetchBlocks } from '../store/blockSlice';

import PropTypes from 'prop-types';

function Home({ showFileExplorer, showPreview, togglePreview }) {
  const dispatch = useDispatch();
  const currentWorkspace = useSelector(state => state.auth.currentWorkspace);

  // États locaux pour gérer le contenu Markdown, le fichier courant et le statut de sauvegarde
  const [markdown, setMarkdown] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Sélection des données depuis le store Redux
  const { files } = useSelector((state) => state.fileSystem);
  const images = useSelector((state) => state.images.images);
  const blocks = useSelector((state) => state.blocks.blocks);

  // Référence à l'éditeur Markdown
  const editorRef = useRef(null);

  // Effet pour charger les données initiales lors du changement d'espace de travail
  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchFileSystem(currentWorkspace.id));
      dispatch(fetchImages(currentWorkspace.id));
      dispatch(fetchBlocks(currentWorkspace.id));
    }
  }, [dispatch, currentWorkspace]);

  // Effet pour mettre à jour le contenu Markdown lorsque le fichier courant change
  useEffect(() => {
    if (currentFile) {
      const file = files.find(f => f.id === currentFile.id);
      if (file) {
        setMarkdown(file.content);
      }
    }
  }, [currentFile, files]);

  // Fonction pour cacher le statut de sauvegarde après un délai
  const hideSaveStatus = useCallback(() => {
    setSaveStatus(null);
  }, []);

  // Gestion du changement de contenu et sauvegarde automatique
  const handleContentChange = (newContent) => {
    setMarkdown(newContent);
    if (currentFile) {
      console.log('Sauvegarde en cours...', { fileId: currentFile.id, newContent });
      dispatch(updateFile({ ...currentFile, content: newContent }))
        .then(() => {
          console.log('Sauvegarde réussie');
          setSaveStatus('saved');
          setTimeout(hideSaveStatus, 2000);
        })
        .catch((error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          setSaveStatus('error');
          setTimeout(hideSaveStatus, 2000);
        });
    } else {
      console.log('Aucun fichier sélectionné pour la sauvegarde');
    }
  };

  // Gestion de la sélection d'un fichier
  const handleFileSelect = (file) => {
    console.log('Fichier sélectionné:', file);
    setCurrentFile(file);
  };

  // Gestion des actions de la barre d'outils
  const handleToolbarAction = (action, markdownSyntax) => {
    const editor = editorRef.current;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = markdown.substring(start, end);
    let replacement = '';

    switch (action) {
      case 'bold':
      case 'italic':
      case 'strikethrough':
      case 'code':
      case 'highlight':
        replacement = `${markdownSyntax}${selectedText}${markdownSyntax}`;
        break;
      case 'orderedList':
      case 'unorderedList':
        replacement = selectedText.split('\n').map(line => `${markdownSyntax}${line}`).join('\n');
        break;
      case 'link':
        replacement = selectedText ? `[${selectedText}](url)` : `[](url)`;
        break;
      case 'table':
      case 'codeBlock':
      case 'blockquote':
      case 'hr':
        replacement = `\n${markdownSyntax}${selectedText}\n`;
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        replacement = `${markdownSyntax}${selectedText}`;
        break;
      case 'paragraph':
        replacement = `\n${selectedText}\n`;
        break;
      default:
        return;
    }

    const newContent = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newContent);
    handleContentChange(newContent);

    setTimeout(() => {
      editor.selectionStart = start + markdownSyntax.length;
      editor.selectionEnd = start + replacement.length;
      editor.focus();
    }, 0);
  };

  // Gestion de la sélection d'un bloc personnalisé
  const handleBlockSelect = (block) => {
    const blockContent = `\n${block.content}\n`;
    const newContent = markdown + blockContent;
    setMarkdown(newContent);
    handleContentChange(newContent);
  };

  // Création d'un nouveau fichier
  const handleCreateNewFile = () => {
    if (!currentWorkspace) return;
    const newFile = {
      id: uuidv4(),
      name: 'Nouveau fichier.md',
      content: '',
      parentId: 'root',
      workspaceId: currentWorkspace.id
    };
    dispatch(addFile(newFile)).then(() => {
      setCurrentFile(newFile);
      setMarkdown('');
    });
  };

  // Composant pour afficher lorsqu'aucun fichier n'est pas sélectionné
  const NoFileSelected = () => (
    <div className="flex flex-col items-center justify-center h-full text-obsidian-text">
      <AiOutlineSelect className="text-6xl mb-4" />
      <h2 className="text-2xl font-bold mb-2">Aucun fichier sélectionné</h2>
      <p className="mb-4 text-center">Sélectionnez un fichier dans l'explorateur ou créez-en un nouveau.</p>
      <button
        onClick={handleCreateNewFile}
        className="flex items-center px-4 py-2 bg-obsidian-accent text-obsidian-bg rounded hover:bg-opacity-80 transition-colors"
      >
        <AiOutlineFileAdd className="mr-2" />
        Créer un nouveau fichier
      </button>
    </div>
  );

  // Gestion de la sélection d'une image
  const handleImageSelect = (image) => {
    const imageMarkdown = `![${image.name}](local://${image.id})`;
    const newContent = markdown + '\n' + imageMarkdown;
    setMarkdown(newContent);
    handleContentChange(newContent);
  };

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.redo();
    }
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row h-full font-sans">
        {showFileExplorer && (
          <div className="w-full md:w-64 bg-obsidian-hover border-b md:border-r border-obsidian-border">
            <FileExplorer onFileSelect={handleFileSelect} />
          </div>
        )}
        <div className="flex-1 flex flex-col relative">
          <Toolbar
            onAction={handleToolbarAction}
            blocks={blocks}
            images={images}
            onBlockSelect={handleBlockSelect}
            onImageSelect={handleImageSelect}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
          <div className="flex-1 flex flex-col md:flex-row">
            <div className={`w-full md:w-1/2 ${showPreview ? 'hidden md:block' : 'block'} h-full border-b md:border-r border-obsidian-border`}>
              {currentFile ? (
                <MarkdownEditor ref={editorRef} value={markdown} onChange={handleContentChange} />
              ) : (
                <NoFileSelected />
              )}
            </div>
            <div className={`w-full md:w-1/2 ${showPreview ? 'block' : 'hidden md:block'} h-full`}>
              <MarkdownPreview markdown={markdown} />
            </div>
          </div>
          <div className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out transform ${saveStatus ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
            <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
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
          <button
            className="md:hidden absolute bottom-4 right-4 bg-obsidian-hover text-obsidian-text p-2 rounded-full"
            onClick={togglePreview}
          >
            {showPreview ? <AiOutlineEyeInvisible className="text-xl" /> : <AiOutlineEye className="text-xl" />}
          </button>
        </div>
      </div>
    </DndProvider>
  );
}

Home.propTypes = {
  showFileExplorer: PropTypes.bool.isRequired,
  showPreview: PropTypes.bool.isRequired,
  togglePreview: PropTypes.func.isRequired
};

export default Home;