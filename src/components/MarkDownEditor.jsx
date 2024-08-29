import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaEye, FaSave, FaFileAlt, FaCubes, FaImages, FaFileExport, FaFolder } from 'react-icons/fa';
import { updateFileContent, updateUndoStack, updateRedoStack, checkFileExists, setSelectedFile } from '../redux/actions/fileExplorerActions';
import { setAutoSave, setShowPreview } from '../redux/actions/markdownEditorActions';
import debounce from 'lodash/debounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMarkdownConverter } from '../hooks/useMarkdownConverter';
import Toolbar from './Toolbar';
import { useFileExport } from '../hooks/useFileExport';
import { createSelector } from 'reselect';
import showdown from 'showdown';
import { useMarkdownShortcuts } from '../hooks/useMarkdownShortcuts';

const selectFileExplorer = state => state.fileExplorer;

const selectUndoStack = createSelector(
  [selectFileExplorer],
  (fileExplorer) => fileExplorer.undoStack || []
);

const selectRedoStack = createSelector(
  [selectFileExplorer],
  (fileExplorer) => fileExplorer.redoStack || []
);

const selectMarkdownEditor = state => state.markdownEditor;

const selectAutoSave = createSelector(
  [selectMarkdownEditor],
  (markdownEditor) => markdownEditor.autoSave
);

const selectShowPreview = createSelector(
  [selectMarkdownEditor],
  (markdownEditor) => markdownEditor.showPreview
);

function MarkdownEditor({ className, isFileExplorerOpen, initialContent, onContentChange, isEditingBloc = false }) {
  const dispatch = useDispatch();
  const selectedFile = useSelector(state => state.fileExplorer.selectedFile);
  const selectedFileContent = useSelector(state => state.fileExplorer.selectedFileContent);
  const autoSave = useSelector(selectAutoSave);
  const showPreview = useSelector(selectShowPreview);
  const undoStack = useSelector(selectUndoStack);
  const redoStack = useSelector(selectRedoStack);

  const [markdown, setMarkdown] = useState(isEditingBloc ? initialContent : '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  const blocs = useSelector(state => state.blocs);
  const images = useSelector(state => state.images.images);
  const [showBlocs, setShowBlocs] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const converter = new showdown.Converter();

  const [hoveredLink, setHoveredLink] = useState(null);
  const files = useSelector(state => state.fileExplorer.files);

  const convertWikiLinks = useCallback((content) => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const [fileName, alias] = p1.split('|');
      const displayText = alias || fileName;
      return `<a href="#" class="wikilink" data-filename="${fileName}">${displayText}</a>`;
    });
  }, []);

  const html = useMarkdownConverter(convertWikiLinks(markdown), images, blocs);

  const { handleSave, handleUndo, handleRedo, insertFormatting } = useKeyboardShortcuts(markdown, setMarkdown, selectedFile, textareaRef);

  const { exportMarkdown, isExporting } = useFileExport();

  const handleManualSave = useCallback((e) => {
    handleSave(e);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 500);
  }, [handleSave]);

  const [fileExists, setFileExists] = useState(true);

  useEffect(() => {
    if (selectedFile) {
      dispatch(checkFileExists(selectedFile));
    }
  }, [selectedFile, dispatch]);

  useEffect(() => {
    if (isEditingBloc) {
      setMarkdown(initialContent);
    } else if (selectedFile && selectedFileContent !== undefined) {
      setMarkdown(selectedFileContent);
    }
  }, [isEditingBloc, initialContent, selectedFile, selectedFileContent]);

  const debouncedSave = useCallback(
    debounce((content) => {
      if (selectedFile && autoSave) {
        dispatch(updateFileContent(selectedFile, content));
        setIsSaving(false);
      }
    }, 1000),
    [selectedFile, autoSave, dispatch]
  );

  const { handleShortcuts, showBubble, bubblePosition, filteredShortcuts, selectedIndex } = useMarkdownShortcuts(setMarkdown);

  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setMarkdown(newContent);
    handleShortcuts(e); // Ajoutez ceci pour vérifier les raccourcis à chaque changement
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

  const handleKeyDown = useCallback((e) => {
    const shortcuts = {
      's': handleSave,
      'z': handleUndo,
      'y': handleRedo,
      'b': () => insertFormatting('**'),
      'i': () => insertFormatting('*'),
      'k': () => insertFormatting('[', '](url)'),
      '`': () => insertFormatting('`'),
    };

    if ((e.ctrlKey || e.metaKey) && shortcuts[e.key.toLowerCase()]) {
      e.preventDefault();
      shortcuts[e.key.toLowerCase()](e);
    }
  }, [handleSave, handleUndo, handleRedo, insertFormatting]);

  const toggleView = () => {
    dispatch(setShowPreview(!showPreview));
  };

  const toggleAutoSave = () => {
    dispatch(setAutoSave(!autoSave));
  };

  const insertBloc = (blocId) => {
    const bloc = blocs.find(b => b.id === blocId);
    if (bloc) {
      // Insérer directement le contenu du bloc
      insertFormatting(bloc.content, '');
      setShowBlocs(false); // Ferme le menu des blocs après l'insertion
    }
  };

  const insertImage = (image) => {
    const imageShortcut = `<img-shortcut id="${image.id}" alt="${image.nom}" />`;
    insertBloc(imageShortcut);
  };

  const handleExport = useCallback(() => {
    exportMarkdown(markdown, selectedFile);
  }, [exportMarkdown, markdown, selectedFile]);

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

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-gray-800 text-gray-300 px-4 py-2 font-semibold flex flex-wrap justify-between items-center">
        {renderBreadcrumb()}
        <span className="mr-4 mb-2 sm:mb-0">
          {isEditingBloc ? 'Édition de bloc' : (fileExists && selectedFile ? selectedFile.split('/').pop() : 'Aucun fichier sélectionné')}
        </span>
        <div className="flex flex-wrap items-center space-x-2 space-y-2 sm:space-y-0">
          {selectedFile && (
            <>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Auto-save</span>
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${autoSave ? 'bg-blue-500' : 'bg-gray-600'}`}
                  onClick={toggleAutoSave}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${autoSave ? 'translate-x-5' : ''}`}
                  ></div>
                </div>
              </div>
              <button
                onClick={handleManualSave}
                className={`bg-blue-600 hover:bg-blue-500 text-white font-medium py-1 px-3 rounded-md transition duration-300 flex items-center ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSaving}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                <FaSave className="ml-2" />
              </button>
            </>
          )}
          <button
            onClick={toggleView}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded-md transition duration-300 flex items-center"
          >
            {showPreview ? (
              <>
                <FaEdit className="mr-2" />
                Éditer
              </>
            ) : (
              <>
                <FaEye className="mr-2" />
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
            <div className="bg-gray-800 text-gray-300 px-4 py-2 flex flex-wrap gap-2">
              <FaCubes className="mr-2" />
              {blocs.map(bloc => (
                <button
                  key={bloc.id}
                  onClick={() => insertBloc(bloc.id)}
                  className="bg-gray-700 hover:bg-gray-600 text-sm py-1 px-2 rounded transition duration-300"
                >
                  {bloc.name}
                </button>
              ))}
            </div>
          )}
          {showImages && (
            <div className="bg-gray-800 text-gray-300 px-4 py-2 flex flex-wrap gap-2">
              <FaImages className="mr-2" />
              {images.map(image => (
                <button
                  key={image.id}
                  onClick={() => insertImage(image)}
                  className="bg-gray-700 hover:bg-gray-600 text-sm py-1 px-2 rounded transition duration-300 flex items-center"
                >
                  <img
                    src={`data:image/jpeg;base64,${image.data}`}
                    alt={image.nom}
                    className="w-6 h-6 object-cover mr-2 rounded"
                  />
                  {image.nom}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 flex flex-col md:flex-row h-full">
            <div className={`w-full md:w-1/2 h-full flex flex-col ${showPreview ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex-1 flex overflow-hidden">
                <div
                  ref={lineNumbersRef}
                  className="bg-gray-800 text-gray-500 p-4 text-right overflow-hidden"
                  style={{ width: '3em', userSelect: 'none' }}
                >
                  {lineNumbers.map(num => (
                    <div key={num} className="leading-6">{num}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="flex-1 p-4 font-mono resize-none bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-full"
                  value={markdown}
                  onChange={handleChange}
                  onKeyDown={handleShortcuts}
                  onScroll={handleScroll}
                />
              </div>
            </div>
            <div className="hidden md:block w-px bg-gray-600"></div>
            <div className={`w-full md:w-1/2 h-full flex flex-col ${showPreview ? 'flex' : 'hidden md:flex'}`}>
              <div
                className="flex-1 p-4 overflow-y-auto bg-gray-700 text-gray-100 h-full"
                onMouseMove={handleLinkHover}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: html }}
                  className="prose prose-invert prose-sm max-w-none"
                />
                {renderLinkPreview()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-700">
          <div className="text-center text-gray-400">
            <FaFileAlt className="mx-auto text-5xl mb-4 opacity-50" />
            <h2 className="text-xl font-light mb-2">Aucun fichier sélectionné</h2>
            <p className="text-sm max-w-md mx-auto">
              Sélectionnez un fichier dans l'explorateur pour commencer à éditer,
              ou créez un nouveau fichier pour démarrer un nouveau projet.
            </p>
          </div>
        </div>
      )}
      {showBubble && (
        <div
          className="absolute bg-gray-800 border border-gray-600 rounded-md shadow-lg p-2 z-10"
          style={{ top: bubblePosition.top, left: bubblePosition.left }}
        >
          {Object.entries(filteredShortcuts).map(([shortcut, { icon: Icon, description }], index) => (
            <div
              key={shortcut}
              className={`flex items-center p-1 hover:bg-gray-700 cursor-pointer ${index === selectedIndex ? 'bg-gray-600' : ''}`}
            >
              <Icon className="mr-2" />
              <span>{shortcut}</span>
              <span className="ml-2 text-gray-400">{description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(MarkdownEditor);