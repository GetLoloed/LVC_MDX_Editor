import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { addFile, addFolder, updateFile, updateFolder, deleteFile, deleteFolder, moveItem, fetchAllItems } from '../../store/fileSystemSlice';
import { AiOutlineFile, AiOutlineFolder, AiOutlinePlus, AiOutlineCloudUpload, AiOutlineImport, AiOutlineExport } from 'react-icons/ai';
import FileExplorerItem from './FileExplorerItem';
import ContextMenu from './ContextMenu';
import CreateItemInput from './CreateItemInput';

function FileExplorer({ onFileSelect }) {
  const dispatch = useDispatch();
  const { files, folders, status } = useSelector((state) => state.fileSystem);
  const currentWorkspace = useSelector(state => state.auth.currentWorkspace);
  const [editingId, setEditingId] = useState(null);
  const [creatingType, setCreatingType] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [openFolders, setOpenFolders] = useState(new Set(['root']));
  const contextMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Effet pour charger les éléments du système de fichiers lorsque l'espace de travail change
  useEffect(() => {
    if (status === 'idle' && currentWorkspace) {
      dispatch(fetchAllItems(currentWorkspace.id));
    }
  }, [dispatch, status, currentWorkspace]);

  // Configuration du drop pour les fichiers externes (glisser-déposer)
  const [{ isOverExternal }, dropExternal] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item, monitor) => {
      if (monitor.getItemType() === NativeTypes.FILE) {
        handleExternalFileDrop(item.files);
      }
    },
    collect: (monitor) => ({
      isOverExternal: monitor.isOver(),
    }),
  }), []);

  // Configuration du drop pour les éléments internes (déplacement dans l'arborescence)
  const [{ isOverInternal, canDropInternal }, dropInternal] = useDrop({
    accept: 'INTERNAL_ITEM',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        handleMove(item, { id: 'root', type: 'folder' });
      }
    },
    collect: (monitor) => ({
      isOverInternal: monitor.isOver({ shallow: true }),
      canDropInternal: monitor.canDrop(),
    }),
  });

  // Gestion du drop de fichiers externes
  const handleExternalFileDrop = (droppedFiles) => {
    Array.from(droppedFiles).forEach(file => {
      if (file?.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const newId = uuidv4();
          dispatch(addFile({ id: newId, name: file.name, content, parentId: 'root', workspaceId: currentWorkspace.id }));
        };
        reader.readAsText(file);
      }
    });
  };

  // Gestion du renommage d'un élément (fichier ou dossier)
  const handleRename = (item, type, newName) => {
    if (newName.trim() && newName !== item.name) {
      if (type === 'file') {
        dispatch(updateFile({ ...item, name: newName }));
      } else {
        dispatch(updateFolder({ ...item, name: newName }));
      }
    }
    setEditingId(null);
  };

  // Gestion de la création d'un nouvel élément (fichier ou dossier)
  const handleCreate = (type, name) => {
    if (name.trim() && currentWorkspace) {
      const newId = uuidv4();
      if (type === 'file') {
        dispatch(addFile({ id: newId, name, content: '', parentId: 'root', workspaceId: currentWorkspace.id }));
      } else if (type === 'folder') {
        dispatch(addFolder({ id: newId, name, parentId: 'root', workspaceId: currentWorkspace.id }));
      }
    }
    setCreatingType(null);
  };

  // Gestion de la suppression d'un élément
  const handleDelete = (item, type) => {
    if (type === 'file') {
      dispatch(deleteFile(item.id));
    } else {
      dispatch(deleteFolder(item.id));
    }
    setContextMenu(null);
  };

  // Gestion de l'affichage du menu contextuel
  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    const yOffset = -10;
    setContextMenu({
      x: e.clientX,
      y: e.clientY + yOffset,
      item,
      type
    });
  };

  // Gestion du déplacement d'un élément
  const handleMove = (draggedItem, targetItem) => {
    if (!targetItem || draggedItem.id === targetItem.id) {
      return;
    }

    let destinationParentId = targetItem.id;

    // Si la cible est un fichier, on utilise son parent comme destination
    if (targetItem.type === 'file') {
      destinationParentId = targetItem.parentId;
    }

    // Vérification si le déplacement est valide (pas dans un sous-dossier de lui-même)
    if (draggedItem.type === 'folder' && isSubfolder(draggedItem.id, destinationParentId)) {
      console.log("Impossible de déplacer un dossier dans son propre sous-dossier");
      return;
    }

    dispatch(moveItem({
      id: draggedItem.id,
      type: draggedItem.type,
      destinationParentId: destinationParentId,
    }));
  };

  // Fonction pour vérifier si un dossier est un sous-dossier
  const isSubfolder = (parentId, childId) => {
    const folder = folders.find(f => f.id === childId);
    if (!folder) return false;
    if (folder.id === parentId) return true;
    return isSubfolder(parentId, folder.parentId);
  };

  // Gestion de l'ouverture/fermeture des dossiers
  const toggleFolder = (folderId) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Gestion du clic sur un fichier
  const handleFileClick = (file) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  // Rendu récursif des éléments de l'arborescence
  const renderItems = (parentId = 'root') => {
    const folderItems = folders.filter(folder => folder.parentId === parentId);
    const fileItems = files.filter(file => file.parentId === parentId);

    const items = [...folderItems, ...fileItems];

    return items.map((item) => (
      <FileExplorerItem
        key={`${item.type}-${item.id}`}
        item={item}
        isEditing={editingId === item.id}
        isOpen={openFolders.has(item.id)}
        onRename={(newName) => handleRename(item, item.type, newName)}
        onContextMenu={handleContextMenu}
        setEditingId={setEditingId}
        onMove={handleMove}
        onToggle={() => toggleFolder(item.id)}
        onFileClick={handleFileClick}
      >
        {item.type === 'folder' && openFolders.has(item.id) && renderItems(item.id)}
      </FileExplorerItem>
    ));
  };

  // Gestion du clic sur le bouton d'importation
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  // Gestion de l'importation de fichier
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file?.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newId = uuidv4();
        dispatch(addFile({ id: newId, name: file.name, content, parentId: 'root', workspaceId: currentWorkspace.id }));
      };
      reader.readAsText(file);
    }
    event.target.value = null;
  };

  // Gestion de l'exportation de fichier
  const handleExport = () => {
    if (selectedFile) {
      const blob = new Blob([selectedFile.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      let fileName = selectedFile.name;
      if (!fileName.toLowerCase().endsWith('.md')) {
        fileName += '.md';
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.log("Aucun fichier sélectionné pour l'exportation");
    }
  };

  return (
    <div
      ref={(node) => {
        dropExternal(node);
        dropInternal(node);
      }}
      className={`relative min-h-[200px] h-full transition-colors duration-200
        ${isOverExternal ? 'bg-obsidian-accent bg-opacity-20' : ''}
        ${isOverInternal && canDropInternal ? 'bg-obsidian-hover' : ''}
      `}
    >
      {isOverExternal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian-bg bg-opacity-90 z-10">
          <AiOutlineCloudUpload className="text-6xl text-obsidian-accent mb-4" />
          <p className="text-obsidian-accent text-xl font-bold">Déposez vos fichiers .md ici</p>
        </div>
      )}
      <div className={`p-4 transition-opacity duration-200 ${isOverExternal ? 'opacity-30' : 'opacity-100'}`}>
        <div className="mb-4 flex space-x-2">
          <button onClick={() => setCreatingType('file')} className="text-obsidian-text hover:text-obsidian-accent">
            <AiOutlinePlus className="inline mr-1" />
            <AiOutlineFile className="inline" />
          </button>
          <button onClick={() => setCreatingType('folder')} className="text-obsidian-text hover:text-obsidian-accent">
            <AiOutlinePlus className="inline mr-1" />
            <AiOutlineFolder className="inline" />
          </button>
          <button onClick={handleImportClick} className="text-obsidian-text hover:text-obsidian-accent md:hidden">
            <AiOutlineImport className="inline" />
          </button>
          <button onClick={handleExport} className="text-obsidian-text hover:text-obsidian-accent" disabled={!selectedFile}>
            <AiOutlineExport className="inline" />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".md"
          style={{ display: 'none' }}
        />
        {creatingType && (
          <CreateItemInput
            type={creatingType}
            onSubmit={(name) => handleCreate(creatingType, name)}
            onCancel={() => setCreatingType(null)}
          />
        )}
        {status === 'loading' ? (
          <div>Chargement...</div>
        ) : (
          <ul className="list-none">
            {renderItems()}
          </ul>
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          ref={contextMenuRef}
          contextMenu={contextMenu}
          onRename={() => {
            setEditingId(contextMenu.item.id);
            setContextMenu(null);
          }}
          onDelete={() => handleDelete(contextMenu.item, contextMenu.type)}
        />
      )}
    </div>
  );
}

FileExplorer.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};

export default FileExplorer;