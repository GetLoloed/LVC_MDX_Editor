import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaFolder, FaFolderOpen, FaFile, FaTrash, FaEdit, FaEllipsisV, FaFolderPlus, FaFileMedical, FaCloudUploadAlt, FaArrowRight, FaPlus, FaSearch, FaSort, FaFilter } from 'react-icons/fa';
import { createFolder, createFile, renameItem, deleteItem, moveItem, selectFile, updateFileContent, searchFiles, sortFiles, filterFiles, importFile } from '../redux/actions/fileExplorerActions';
import Toolbar from './Toolbar';

function FileExplorer() {
  // États et sélecteurs Redux
  const files = useSelector(state => state.fileExplorer.files || []);
  const selectedFilePath = useSelector(state => state.fileExplorer.selectedFile);
  const currentFileContent = useSelector(state => state.fileExplorer.currentFileContent);
  const dispatch = useDispatch();

  // États locaux
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const [isValidFile, setIsValidFile] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [filterType, setFilterType] = useState('all');
  const fileInputRef = useRef(null);

  // Effets pour le logging (à des fins de débogage)
  useEffect(() => {
    console.log('Structure des fichiers:', JSON.stringify(files, null, 2));
  }, [files]);

  useEffect(() => {
    console.log('État des dossiers développés:', expandedFolders);
  }, [expandedFolders]);

  useEffect(() => {
    console.log('Chemin du fichier sélectionné:', selectedFilePath);
  }, [selectedFilePath]);

  // Fonctions de gestion des fichiers
  const handleSelectFile = useCallback((path) => {
    const file = findFileByPath(files, path);
    if (file && file.type === 'file') {
      dispatch(selectFile(path, file.content || ''));
      console.log("Fichier sélectionné:", path, "Contenu:", file.content || '');
    }
  }, [dispatch, files]);

  // Fonction pour appliquer le formatage Markdown
  const applyMarkdownFormatting = (content, action) => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText) return content;

    const start = content.indexOf(selectedText);
    const end = start + selectedText.length;

    let formattedText;
    switch (action) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'unorderedList':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'orderedList':
        formattedText = selectedText.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
        break;
      case 'link':
        const url = prompt("Entrez l'URL du lien :");
        formattedText = url ? `[${selectedText}](${url})` : selectedText;
        break;
      case 'image':
        const imageUrl = prompt("Entrez l'URL de l'image :");
        formattedText = imageUrl ? `![${selectedText}](${imageUrl})` : selectedText;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
      default:
        return content;
    }

    return content.substring(0, start) + formattedText + content.substring(end);
  };

  // Gestion des actions de la barre d'outils
  const handleToolbarAction = useCallback((action, data) => {
    console.log('Action de la barre d\'outils:', action, 'Données:', data);
    switch (action) {
      case 'import':
        if (data && data.content && data.fileName) {
          dispatch(createFile('', data.fileName, data.content));
          dispatch(selectFile(data.fileName, data.content));
        }
        break;
      case 'export':
        console.log('Action d\'exportation déclenchée');
        break;
      case 'bold':
      case 'italic':
      case 'unorderedList':
      case 'orderedList':
      case 'link':
      case 'image':
      case 'code':
      case 'quote':
        if (selectedFilePath) {
          const updatedContent = applyMarkdownFormatting(currentFileContent, action);
          dispatch(updateFileContent(selectedFilePath, updatedContent));
        }
        break;
      case 'undo':
      case 'redo':
      case 'showBlocs':
      case 'showImages':
        console.log(action + ' action déclenchée');
        break;
      default:
        console.log('Action non gérée:', action);
    }
  }, [dispatch, selectedFilePath, currentFileContent]);

  // Fonctions de gestion du glisser-déposer externe
  const handleExternalDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingExternal(true);
      checkValidFile(e);
    }
  };

  const handleExternalDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDraggingExternal) {
      checkValidFile(e);
    }
  };

  const handleExternalDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingExternal(false);
    setIsValidFile(false);
  };

  const checkValidFile = (e) => {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const isValid = Array.from(e.dataTransfer.items).some(item =>
        item.kind === 'file' && item.type === 'text/markdown'
      );
      setIsValidFile(isValid);
    }
  };

  const handleExternalDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingExternal(false);
    setIsValidFile(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          dispatch(createFile('', file.name, content));
        };
        reader.readAsText(file);
      }
    });
  }, [dispatch]);

  // Fonctions de gestion du glisser-déposer interne
  const handleItemDragStart = (e, path, type) => {
    e.stopPropagation();
    setDraggedItem(path);
    setDraggedItemType(type);
    e.dataTransfer.setData('text/plain', path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e, path, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'folder' && draggedItem !== path && !path.startsWith(draggedItem)) {
      setDragOverItem(path);
    }
  };

  const handleItemDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItem(null);
  };

  const handleItemDrop = (e, targetPath, targetType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem && draggedItem !== targetPath && !targetPath.startsWith(draggedItem)) {
      let newTargetPath = targetPath;
      if (targetType === 'file') {
        newTargetPath = targetPath.split('/').slice(0, -1).join('/');
      }
      const draggedItemName = draggedItem.split('/').pop();
      const fullTargetPath = `${newTargetPath}/${draggedItemName}`;

      console.log('Déplacement de l\'élément:', draggedItem, 'vers:', fullTargetPath);
      dispatch(moveItem(draggedItem, fullTargetPath));

      setExpandedFolders(prev => ({ ...prev, [newTargetPath]: true }));
    }
    setDraggedItem(null);
    setDragOverItem(null);
    setDraggedItemType(null);
  };

  // Fonctions de gestion des dossiers et fichiers
  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const newState = { ...prev, [path]: !prev[path] };
      console.log('Basculement du dossier:', path, 'Nouvel état développé:', newState);
      return newState;
    });
  };

  const handleCreateFolder = (path) => {
    const name = prompt('Entrez le nom du nouveau dossier:');
    if (name) {
      dispatch(createFolder(path, name));
    }
    setActiveMenu(null);
  };

  const handleCreateFile = (path) => {
    const name = prompt('Entrez le nom du nouveau fichier:');
    if (name) {
      dispatch(createFile(path, name));
    }
    setActiveMenu(null);
  };

  const handleRenameItem = (path) => {
    const newName = prompt('Entrez le nouveau nom:');
    if (newName) {
      dispatch(renameItem(path, newName));
    }
    setActiveMenu(null);
  };

  const handleDeleteItem = (path) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      dispatch(deleteItem(path));
    }
    setActiveMenu(null);
  };

  // Fonction utilitaire pour trouver un fichier par son chemin
  const findFileByPath = (items, path) => {
    const pathParts = path.split('/').filter(Boolean);
    let currentItems = items;

    for (let i = 0; i < pathParts.length; i++) {
      const item = currentItems.find(item => item.name === pathParts[i]);
      if (!item) return null;
      if (i === pathParts.length - 1) return item;
      if (item.type === 'folder') {
        currentItems = item.children;
      } else {
        return null;
      }
    }
    return null;
  };

  // Gestion du menu contextuel
  const toggleMenu = (path) => {
    setActiveMenu(activeMenu === path ? null : path);
  };

  // Fonction de rendu récursif de l'arborescence des fichiers
  const renderTree = (items, path = '') => {
    return items.map((item, index) => {
      const fullPath = `${path}/${item.name}`;
      const uniqueKey = `${fullPath}-${index}`;
      const isFolder = item.type === 'folder';
      const isDraggedOver = dragOverItem === fullPath;
      const isBeingDragged = draggedItem === fullPath;
      const canDropHere = isFolder && draggedItem !== fullPath && !fullPath.startsWith(draggedItem);
      const isSelected = fullPath === selectedFilePath;

      return (
        <div
          key={uniqueKey}
          className={`mb-2 relative ${isDraggedOver && canDropHere ? 'bg-blue-500 bg-opacity-30 rounded' : ''} ${isBeingDragged ? 'opacity-50' : ''}`}
          draggable
          onDragStart={(e) => handleItemDragStart(e, fullPath, item.type)}
          onDragOver={(e) => handleItemDragOver(e, fullPath, item.type)}
          onDragLeave={handleItemDragLeave}
          onDrop={(e) => handleItemDrop(e, isFolder ? fullPath : path, item.type)}
        >
          {/* Contenu de l'élément (dossier ou fichier) */}
          <div className={`flex items-center justify-between p-2 rounded ${isSelected ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <button
              onClick={() => isFolder ? toggleFolder(fullPath) : handleSelectFile(fullPath)}
              className="flex items-center flex-grow"
            >
              {isFolder ? (
                expandedFolders[fullPath] ? <FaFolderOpen className="mr-2 text-yellow-500" /> : <FaFolder className="mr-2 text-yellow-500" />
              ) : (
                <FaFile className={`mr-2 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
              )}
              <span className={`truncate ${isSelected ? 'font-bold' : ''}`}>{item.name}</span>
            </button>
            <button onClick={() => toggleMenu(fullPath)} className="p-1 hover:bg-gray-600 rounded">
              <FaEllipsisV />
            </button>
          </div>

          {/* Indicateur de dépôt lors du glisser-déposer */}
          {isDraggedOver && canDropHere && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-30 rounded z-10">
              <div className="bg-white text-blue-500 rounded-full p-2">
                <FaArrowRight className="text-2xl" />
              </div>
            </div>
          )}

          {/* Menu contextuel */}
          {activeMenu === fullPath && (
            <div className="ml-6 mt-1 bg-gray-600 rounded p-1 flex justify-around">
              {isFolder && (
                <>
                  <button onClick={() => handleCreateFolder(fullPath)} className="p-1 hover:bg-gray-500 rounded">
                    <FaFolderPlus className="text-yellow-500" title="Nouveau dossier" />
                  </button>
                  <button onClick={() => handleCreateFile(fullPath)} className="p-1 hover:bg-gray-500 rounded">
                    <FaFileMedical className="text-blue-500" title="Nouveau fichier" />
                  </button>
                </>
              )}
              <button onClick={() => handleRenameItem(fullPath)} className="p-1 hover:bg-gray-500 rounded">
                <FaEdit className="text-green-500" title="Renommer" />
              </button>
              <button onClick={() => handleDeleteItem(fullPath)} className="p-1 hover:bg-gray-500 rounded">
                <FaTrash className="text-red-500" title="Supprimer" />
              </button>
            </div>
          )}
          {isFolder && expandedFolders[fullPath] && item.children && item.children.length > 0 && (
            <div className="ml-4 mt-1">
              {renderTree(item.children, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  // Fonctions pour créer des éléments à la racine
  const handleCreateRootFolder = () => {
    const name = prompt('Entrez le nom du nouveau dossier racine:');
    if (name) {
      dispatch(createFolder('', name));
    }
  };

  const handleCreateRootFile = () => {
    const name = prompt('Entrez le nom du nouveau fichier racine:');
    if (name) {
      dispatch(createFile('', name));
    }
  };

  // Fonctions de recherche, tri et filtrage
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    dispatch(searchFiles(term));
  };

  const handleSort = (criteria) => {
    setSortCriteria(criteria);
    dispatch(sortFiles(criteria));
  };

  const handleFilter = (type) => {
    setFilterType(type);
    dispatch(filterFiles(type));
  };

  // Gestion de l'importation de fichiers
  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingExternal(false);
    setIsValidFile(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          dispatch(importFile(file.name, content));
        };
        reader.readAsText(file);
      }
    });
  }, [dispatch]);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          dispatch(importFile(file.name, content));
        };
        reader.readAsText(file);
      }
    });
  };

  const openFileInput = () => {
    fileInputRef.current.click();
  };

  // Rendu du composant
  return (
    <div
      className="flex flex-col h-screen"
      onDragEnter={handleExternalDragEnter}
      onDragOver={handleExternalDragOver}
      onDragLeave={handleExternalDragLeave}
      onDrop={handleFileDrop}
    >
      <div className="bg-gray-800 text-gray-200 p-4 overflow-y-auto flex-grow">
        {/* En-tête de l'explorateur de fichiers */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Explorateur de fichiers</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateRootFolder}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Nouveau dossier"
            >
              <FaFolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreateRootFile}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Nouveau fichier"
            >
              <FaFileMedical className="w-4 h-4" />
            </button>
            <button
              onClick={openFileInput}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Importer un fichier"
            >
              <FaCloudUploadAlt className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileInputChange}
              className="hidden"
              multiple
            />
          </div>
        </div>

        {/* Zone de glisser-déposer pour l'importation de fichiers */}
        {isDraggingExternal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="text-center text-white bg-gray-800 p-8 rounded-lg shadow-lg">
              <FaCloudUploadAlt className={`mx-auto text-6xl mb-4 ${isValidFile ? 'text-green-500' : 'text-gray-300'}`} />
              <p className="text-2xl font-semibold">
                {isValidFile ? 'Déposez votre fichier .md ici' : 'Glissez un fichier .md ici'}
              </p>
              <p className="text-sm mt-2 text-gray-300">
                {isValidFile ? 'Relâchez pour ajouter le fichier' : 'Seuls les fichiers .md sont acceptés'}
              </p>
            </div>
          </div>
        )}

        {/* Indicateur de déplacement en cours */}
        {draggedItem && (
          <div className="fixed bottom-4 right-4 bg-gray-700 text-white p-4 rounded-lg shadow-lg z-30">
            <div className="flex items-center">
              {draggedItemType === 'folder' ? <FaFolder className="mr-2 text-yellow-500" /> : <FaFile className="mr-2 text-blue-500" />}
              <span>Déplacement en cours : {draggedItem.split('/').pop()}</span>
            </div>
          </div>
        )}

        {/* Arborescence des fichiers */}
        {files.length > 0 ? (
          renderTree(files)
        ) : (
          <div className="text-center text-gray-400 mt-8">
            <FaPlus className="mx-auto text-4xl mb-4 opacity-50" />
            <p className="text-lg">Aucun fichier disponible</p>
            <p className="text-sm mt-2">Utilisez les boutons ci-dessus pour ajouter un dossier ou un fichier.</p>
          </div>
        )}

        {/* Contrôles de recherche, tri et filtrage */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          />
          <select
            value={sortCriteria}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value="name">Nom</option>
            <option value="type">Type</option>
            <option value="date">Date</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => handleFilter(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            <option value="all">Tous</option>
            <option value="file">Fichiers</option>
            <option value="folder">Dossiers</option>
          </select>
        </div>
      </div>
      <Toolbar
        onAction={handleToolbarAction}
        content={currentFileContent}
        selectedFile={selectedFilePath}
      />
    </div>
  );
}

export default FileExplorer;