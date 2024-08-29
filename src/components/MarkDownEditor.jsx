import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaEye, FaSave, FaFileAlt, FaCubes, FaImages, FaFileExport, FaFolder, FaLightbulb, FaBolt, FaList, FaCode, FaLink, FaImage } from 'react-icons/fa';
import {
  updateFileContent,
  updateUndoStack,
  updateRedoStack,
  checkFileExists,
  setSelectedFile,
  applyUndoRedo
} from '../redux/actions/fileExplorerActions';
import { setAutoSave, setShowPreview } from '../redux/actions/markdownEditorActions';
import debounce from 'lodash/debounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMarkdownConverter } from '../hooks/useMarkdownConverter';
import Toolbar from './Toolbar';
import { useFileExport } from '../hooks/useFileExport';
import { createSelector } from 'reselect';
import showdown from 'showdown';
import { useMarkdownShortcuts } from '../hooks/useMarkdownShortcuts';

// Sélecteur pour l'état de l'explorateur de fichiers
const selectFileExplorer = state => state.fileExplorer;

// Sélecteur mémorisé pour la pile d'annulation
const selectUndoStack = createSelector(
  [selectFileExplorer],
  (fileExplorer) => fileExplorer.undoStack || []
);

// Sélecteur pour la pile de rétablissement
const selectRedoStack = createSelector(
  [selectFileExplorer],
  (fileExplorer) => fileExplorer.redoStack || []
);

// Sélecteur pour l'état de l'éditeur
const selectMarkdownEditor = state => state.markdownEditor;

// Sélecteur mémorisé pour l'état de l'auto-sauvegarde
const selectAutoSave = createSelector(
  [selectMarkdownEditor],
  (markdownEditor) => markdownEditor.autoSave
);

// Sélecteur mémorisé pour l'état de l'aperçu
const selectShowPreview = createSelector(
  [selectMarkdownEditor],
  (markdownEditor) => markdownEditor.showPreview
);

function MarkdownEditor({ className, isFileExplorerOpen, initialContent, onContentChange, isEditingBloc = false }) {
  // Utilisation de useDispatch et useSelector pour accéder au store Redux
  const dispatch = useDispatch();
  const selectedFile = useSelector(state => state.fileExplorer.selectedFile);
  const selectedFileContent = useSelector(state => state.fileExplorer.selectedFileContent);
  const autoSave = useSelector(selectAutoSave);
  const showPreview = useSelector(selectShowPreview);
  const undoStack = useSelector(selectUndoStack);
  const redoStack = useSelector(selectRedoStack);

  // États locaux pour le contenu Markdown et l'état de sauvegarde
  const [markdown, setMarkdown] = useState(isEditingBloc ? initialContent : '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  // Sélection des blocs et images depuis le store
  const blocs = useSelector(state => state.blocs);
  const images = useSelector(state => state.images.images);
  const [showBlocs, setShowBlocs] = useState(false);
  const [showImages, setShowImages] = useState(false);

  // Initialisation du convertisseur Markdown
  const converter = new showdown.Converter();

  // État pour gérer les liens survolés
  const [hoveredLink, setHoveredLink] = useState(null);
  const files = useSelector(state => state.fileExplorer.files);

  /**
   * Fonction pour convertir les liens wiki en liens HTML
   * 
   * Format d'un lien wiki : [[nom_du_fichier|alias]]
   * 
   * Cette fonctionnalité s'inspire du système de liens internes d'Obsidian.
   * 
   * Pour plus d'informations sur les liens wiki, voir :
   * @see https://docs.github.com/fr/communities/documenting-your-project-with-wikis/editing-wiki-content
   */
  const convertWikiLinks = useCallback((content) => {
    // Vérification du type de contenu
    if (typeof content !== 'string') {
      console.error('Le contenu à convertir n\'est pas une chaîne de caractères:', content);
      return '';
    }
    // Remplacement des liens wiki par des liens HTML
    return content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const [fileName, alias] = p1.split('|');
      const displayText = alias || fileName;
      return `<a href="#" class="wikilink" data-filename="${fileName}">${displayText}</a>`;
    });
  }, []);

  // Conversion du Markdown en HTML avec gestion des liens wiki, images et blocs
  const html = useMarkdownConverter(convertWikiLinks(markdown || ''), images, blocs);

  // Récupération des fonctions de gestion des raccourcis clavier
  const { handleSave, handleUndo, handleRedo, insertFormatting } = useKeyboardShortcuts(markdown, setMarkdown, selectedFile, textareaRef);

  // Récupération des fonctions d'exportation de fichier
  const { exportMarkdown, isExporting } = useFileExport();

  // Gestion de la sauvegarde manuelle
  const handleManualSave = useCallback((e) => {
    handleSave(e);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 500);
  }, [handleSave]);

  // État pour vérifier l'existence du fichier
  const [fileExists, setFileExists] = useState(true);

  // Vérification de l'existence du fichier sélectionné
  useEffect(() => {
    if (selectedFile) {
      dispatch(checkFileExists(selectedFile));
    }
  }, [selectedFile, dispatch]);

  // Mise à jour du contenu Markdown en fonction du fichier sélectionné ou du bloc en édition
  useEffect(() => {
    if (isEditingBloc) {
      setMarkdown(initialContent);
    } else if (selectedFile && selectedFileContent !== undefined) {
      setMarkdown(selectedFileContent);
    }
  }, [isEditingBloc, initialContent, selectedFile, selectedFileContent]);

  // Fonction de sauvegarde différée pour l'auto-sauvegarde
  const debouncedSave = useCallback(
    debounce((content) => {
      if (selectedFile && autoSave) {
        dispatch(updateFileContent(selectedFile, content));
        setIsSaving(false);
      }
    }, 1000),
    [selectedFile, autoSave, dispatch]
  );

  // Récupération des fonctions de gestion des raccourcis Markdown
  const { handleShortcuts, showBubble, bubblePosition, filteredShortcuts, selectedIndex, applyShortcut } = useMarkdownShortcuts(setMarkdown);

  // État pour afficher ou masquer le message d'aide
  const [showHelpMessage, setShowHelpMessage] = useState(true);

  // Gestion des changements dans l'éditeur
  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setMarkdown(newContent);
    setShowHelpMessage(newContent.trim() === '');
    handleShortcuts(e);
    if (isEditingBloc) {
      onContentChange(newContent);
    } else if (selectedFile) {
      dispatch(updateFileContent(selectedFile, newContent));
      dispatch(updateUndoStack(markdown));
      dispatch(updateRedoStack([]));
      setIsSaving(true);
      debouncedSave(newContent);
    }
  }, [isEditingBloc, onContentChange, selectedFile, markdown, debouncedSave, dispatch, handleShortcuts]);

  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    } else if (showBubble) {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          handleShortcuts(e);
          break;
        case 'Escape':
          handleShortcuts(e); // Ferme la bulle
          break;
        default:
          break; // Laisser les autres touches être normales
      }
    } else {
      handleShortcuts(e);
    }
  }, [handleUndo, handleRedo, handleShortcuts, showBubble]);

  // Basculer entre l'aperçu et l'éditeur
  const toggleView = () => {
    dispatch(setShowPreview(!showPreview));
  };

  // Activer/désactiver l'auto-sauvegarde
  const toggleAutoSave = () => {
    dispatch(setAutoSave(!autoSave));
  };

  // Insérer un bloc de contenu
  const insertBloc = (blocId) => {
    const bloc = blocs.find(b => b.id === blocId);
    if (bloc) {
      insertFormatting(bloc.content, '');
      setShowBlocs(false);
    }
  };

  // Insérer une image
  const insertImage = (image) => {
    const imageShortcut = `<img-shortcut id="${image.id}" alt="${image.nom}" />`;
    insertBloc(imageShortcut);
  };

  // Exporter le contenu Markdown
  const handleExport = useCallback(() => {
    exportMarkdown(markdown, selectedFile);
  }, [exportMarkdown, markdown, selectedFile]);

  // Gérer les actions de la barre d'outils
  const handleToolbarAction = useCallback((action, payload) => {
    switch (action) {
      case 'bold':
        insertFormatting('**');
        break;
      case 'italic':
        insertFormatting('*');
        break;
      case 'unorderedList':
        insertFormatting('- ');
        break;
      case 'orderedList':
        insertFormatting('1. ');
        break;
      case 'link':
        insertFormatting('[', '](url)');
        break;
      case 'image':
        insertFormatting('![alt](', ')');
        break;
      case 'code':
        insertFormatting('`');
        break;
      case 'quote':
        insertFormatting('> ');
        break;
      case 'undo':
        handleUndo();
        break;
      case 'redo':
        handleRedo();
        break;
      case 'showBlocs':
        setShowBlocs(!showBlocs);
        break;
      case 'showImages':
        setShowImages(!showImages);
        break;
      case 'export':
        handleExport();
        break;
      case 'insertBloc':
        setShowBlocs(!showBlocs);
        break;
      default:
        break;
    }
  }, [insertFormatting, handleUndo, handleRedo, setShowBlocs, setShowImages, handleExport, showBlocs, showImages]);

  // Gérer les numéros de ligne
  const [lineNumbers, setLineNumbers] = useState([]);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    const updateLineNumbers = () => {
      if (textareaRef.current) {
        const lineCount = textareaRef.current.value.split('\n').length;
        setLineNumbers(Array.from({ length: lineCount }, (_, i) => i + 1));
      }
    };

    updateLineNumbers();
    window.addEventListener('resize', updateLineNumbers);
    return () => window.removeEventListener('resize', updateLineNumbers);
  }, [markdown]);

  // Synchroniser le défilement des numéros de ligne
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Gérer le survol des liens
  const handleLinkHover = useCallback((event) => {
    const link = event.target.closest('.wikilink');
    if (link) {
      const fileName = link.getAttribute('data-filename');
      setHoveredLink(fileName);
    } else {
      setHoveredLink(null);
    }
  }, []);

  const renderLinkPreview = useCallback(() => {
    if (!hoveredLink) return null;

    const linkedFile = files.find(file => file.name === hoveredLink);
    const linkedContent = linkedFile ? linkedFile.content : "Contenu non disponible";

    // Convertir le contenu Markdown en HTML
    // Permet de limiter la taille du contenu affiché
    const htmlContent = converter.makeHtml(linkedContent.substring(0, 500));

    return (
      <div className="absolute z-10 bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-blue-300">{hoveredLink}</h3>
        <div
          className="text-sm prose prose-invert prose-sm max-h-60 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  }, [hoveredLink, files, converter]);

  const renderBreadcrumb = () => {
    if (!selectedFile || isEditingBloc) return null;

    const parts = selectedFile.split('/');
    return (
      <div className="flex items-center text-sm text-gray-400 mb-2">
        <FaFolder className="mr-2" />
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-2">/</span>}
            <span className={index === parts.length - 1 ? "text-gray-200" : ""}>{part}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderHelpMessage = () => (
    <div className="absolute inset-0 p-4 sm:p-6 md:p-8 text-gray-400 pointer-events-none overflow-auto bg-gray-800 bg-opacity-95">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-300 flex items-center">
          <FaLightbulb className="mr-2" />
          Bienvenue dans l'éditeur Markdown !
        </h2>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300 flex items-center">
            <FaBolt className="mr-2" />
            Commandes rapides
          </h3>
          <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
            {[
              { icon: FaList, command: '/tit', description: 'Insérer un titre' },
              { icon: FaList, command: '/bull', description: 'Créer une liste à puces' },
              { icon: FaCode, command: '/code', description: 'Insérer un bloc de code' },
              { icon: FaLink, command: '/link', description: 'Insérer un lien' },
              { icon: FaImage, command: '/image', description: 'Insérer une image' },
            ].map(({ icon: Icon, command, description }) => (
              <li key={command} className="flex items-center">
                <Icon className="mr-2 text-green-400" />
                <span className="font-mono text-pink-300 mr-2">{command}</span>
                <span>-</span>
                <span className="ml-2">{description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Fonctionnalités</h3>
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li>Auto-sauvegarde</li>
            <li>Aperçu en temps réel</li>
            <li>Insertion de blocs et d'images</li>
            <li>Navigation entre les fichiers</li>
          </ul>
        </div>

        <p className="mt-6 sm:mt-8 text-xs sm:text-sm italic text-gray-500">
          Commencez à taper pour faire disparaître ce message.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-gray-800 text-gray-300 px-2 sm:px-4 py-2 font-semibold flex flex-wrap justify-between items-center">
        {renderBreadcrumb()}
        <span className="mr-2 sm:mr-4 mb-2 sm:mb-0 text-sm sm:text-base">
          {isEditingBloc ? 'Édition de bloc' : (fileExists && selectedFile ? selectedFile.split('/').pop() : 'Aucun fichier sélectionné')}
        </span>
        <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 space-y-2 sm:space-y-0">
          {selectedFile && (
            <>
              <div className="flex items-center">
                <span className="mr-2 text-xs sm:text-sm">Auto-save</span>
                <div
                  className={`w-8 sm:w-10 h-4 sm:h-5 flex items-center rounded-full p-1 cursor-pointer ${autoSave ? 'bg-blue-500' : 'bg-gray-600'}`}
                  onClick={toggleAutoSave}
                >
                  <div
                    className={`bg-white w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-md transform transition-transform duration-300 ${autoSave ? 'translate-x-4 sm:translate-x-5' : ''}`}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleManualSave}
                className={`bg-blue-600 hover:bg-blue-500 text-white font-medium py-1 px-2 sm:px-3 rounded-md transition duration-300 flex items-center text-xs sm:text-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSaving}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                <FaSave className="ml-1 sm:ml-2" />
              </button>
            </>
          )}
          <button
            onClick={toggleView}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-1 px-2 sm:px-3 rounded-md transition duration-300 flex items-center text-xs sm:text-sm"
          >
            {showPreview ? (
              <>
                <FaEdit className="mr-1 sm:mr-2" />
                Éditer
              </>
            ) : (
              <>
                <FaEye className="mr-1 sm:mr-2" />
                Aperçu
              </>
            )}
          </button>
        </div>
      </div>
      {(fileExists && selectedFile) || isEditingBloc ? (
        <div className="flex-1 flex flex-col">
          <Toolbar onAction={handleToolbarAction} isExporting={isExporting} />
          {showBlocs && (
            <div className="bg-gray-800 text-gray-300 px-2 sm:px-4 py-2 flex flex-wrap gap-1 sm:gap-2">
              <FaCubes className="mr-1 sm:mr-2" />
              {blocs.map(bloc => (
                <button
                  key={bloc.id}
                  onClick={() => insertBloc(bloc.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm py-1 px-2 rounded transition duration-300"
                >
                  {bloc.name}
                </button>
              ))}
            </div>
          )}
          {showImages && (
            <div className="bg-gray-800 text-gray-300 px-2 sm:px-4 py-2 flex flex-wrap gap-1 sm:gap-2">
              <FaImages className="mr-1 sm:mr-2" />
              {images.map(image => (
                <button
                  key={image.id}
                  onClick={() => insertImage(image)}
                  className="bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm py-1 px-2 rounded transition duration-300 flex items-center"
                >
                  <img
                    src={`data:image/jpeg;base64,${image.data}`}
                    alt={image.nom}
                    className="w-4 h-4 sm:w-6 sm:h-6 object-cover mr-1 sm:mr-2 rounded"
                  />
                  {image.nom}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 flex flex-col sm:flex-row h-full">
            <div className={`w-full sm:w-1/2 h-full flex flex-col ${showPreview ? 'hidden sm:flex' : 'flex'}`}>
              <div className="flex-1 flex overflow-hidden relative">
                <div
                  ref={lineNumbersRef}
                  className="bg-gray-800 text-gray-500 p-2 sm:p-4 text-right overflow-hidden text-xs sm:text-sm"
                  style={{ width: '2em', userSelect: 'none' }}
                >
                  {lineNumbers.map(num => (
                    <div key={num} className="leading-5 sm:leading-6">{num}</div>
                  ))}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    className="w-full h-full p-2 sm:p-4 font-mono text-xs sm:text-sm resize-none bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={markdown}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                  />
                  {showHelpMessage && renderHelpMessage()}
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-gray-600"></div>
            <div className={`w-full sm:w-1/2 h-full flex flex-col ${showPreview ? 'flex' : 'hidden sm:flex'}`}>
              <div
                className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-700 text-gray-100 h-full"
                onMouseMove={handleLinkHover}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: html }}
                  className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm"
                />
                {renderLinkPreview()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-700">
          <div className="text-center text-gray-400 p-4">
            <FaFileAlt className="mx-auto text-3xl sm:text-5xl mb-2 sm:mb-4 opacity-50" />
            <h2 className="text-lg sm:text-xl font-light mb-1 sm:mb-2">Aucun fichier sélectionné</h2>
            <p className="text-xs sm:text-sm max-w-md mx-auto">
              Sélectionnez un fichier dans l'explorateur pour commencer à éditer,
              ou créez un nouveau fichier pour démarrer un nouveau projet.
            </p>
          </div>
        </div>
      )}
      {showBubble && (
        <div
          className="absolute bg-gray-800 border border-gray-600 rounded-md shadow-lg p-1 sm:p-2 z-10 text-xs sm:text-sm"
          style={{ top: bubblePosition.top, left: bubblePosition.left }}
        >
          {Object.entries(filteredShortcuts).map(([shortcut, { icon: Icon, description }], index) => (
            <div
              key={shortcut}
              className={`flex items-center p-1 hover:bg-gray-700 cursor-pointer ${index === selectedIndex ? 'bg-gray-600' : ''}`}
              onClick={() => applyShortcut(shortcut)}
            >
              <Icon className="mr-1 sm:mr-2" />
              <span>{shortcut}</span>
              <span className="ml-1 sm:ml-2 text-gray-400">{description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(MarkdownEditor);