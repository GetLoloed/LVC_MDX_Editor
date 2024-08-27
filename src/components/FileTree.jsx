import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFolder, FaFolderOpen, FaFile, FaTrash, FaPlus } from 'react-icons/fa';
import { selectFileStructure } from '../utils/selector';
import {
  createFolder,
  createFile,
  renameItem,
  deleteItem,
  moveItem,
  selectFile,
  reorderItems
} from '../features/fileStructureSlice';

const FileTreeItem = ({ item, level = 0, onFileSelect }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [showActions, setShowActions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current.focus();
    }
  }, [isRenaming]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleRename = (e) => {
    e.preventDefault();
    if (newName.trim() !== '' && newName !== item.name) {
      dispatch(renameItem({ id: item.id, newName: newName.trim() }));
    }
    setIsRenaming(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteItem(item.id));
  };

  const handleCreateFile = (e) => {
    e.stopPropagation();
    dispatch(createFile({ parentId: item.id, name: 'Nouveau fichier' }));
    setIsOpen(true);
  };

  const handleCreateFolder = (e) => {
    e.stopPropagation();
    dispatch(createFolder({ parentId: item.id, name: 'Nouveau dossier' }));
    setIsOpen(true);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, type: item.type }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedData = JSON.parse(e.dataTransfer.getData('text'));
    const draggedItemId = draggedData.id;

    if (draggedItemId !== item.id) {
      if (item.type === 'folder') {
        dispatch(moveItem({ sourceId: draggedItemId, targetId: item.id }));
        setIsOpen(true);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.bottom - rect.top;
        const position = y < height / 2 ? 'before' : 'after';
        dispatch(reorderItems({ sourceId: draggedItemId, targetId: item.id, position }));
      }
    }
  };

  return (
    <div className={`ml-${level * 4}`}>
      <div
        className={`flex items-center p-2 rounded cursor-pointer transition duration-150 ease-in-out group ${isDragOver ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        onClick={() => {
          if (item.type === 'folder') {
            handleToggle();
          } else {
            dispatch(selectFile(item.id));
            onFileSelect(item);
          }
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onDoubleClick={() => setIsRenaming(true)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {item.type === 'folder' ? (
          isOpen ? <FaFolderOpen className="mr-2 text-yellow-500" /> : <FaFolder className="mr-2 text-yellow-500" />
        ) : (
          <FaFile className="mr-2 text-blue-500" />
        )}
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-grow">
            <input
              ref={renameInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              className="w-full px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        ) : (
          <span className="flex-grow text-gray-700">{item.name}</span>
        )}
        {showActions && (
          <div className="flex space-x-1">
            {item.type === 'folder' && (
              <>
                <button onClick={handleCreateFile} className="p-1 hover:bg-gray-200 rounded">
                  <FaFile className="text-blue-500" />
                </button>
                <button onClick={handleCreateFolder} className="p-1 hover:bg-gray-200 rounded">
                  <FaFolder className="text-yellow-500" />
                </button>
              </>
            )}
            <button onClick={handleDelete} className="p-1 hover:bg-gray-200 rounded">
              <FaTrash className="text-red-500" />
            </button>
          </div>
        )}
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div className="ml-4">
          {item.children.map(child => (
            <FileTreeItem key={child.id} item={child} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ onFileSelect }) => {
  const dispatch = useDispatch();
  const fileStructure = useSelector(selectFileStructure);

  const handleCreateRootFolder = () => {
    dispatch(createFolder({ parentId: 'root', name: 'Nouveau dossier' }));
  };

  const handleCreateRootFile = () => {
    dispatch(createFile({ parentId: 'root', name: 'Nouveau fichier' }));
  };

  if (!fileStructure) {
    return <div className="p-4 text-center text-gray-500">Chargement de la structure de fichiers...</div>;
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={handleCreateRootFolder}
          className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-150 ease-in-out"
        >
          <FaFolder className="mr-2" /> Nouveau dossier
        </button>
        <button
          onClick={handleCreateRootFile}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out"
        >
          <FaFile className="mr-2" /> Nouveau fichier
        </button>
      </div>
      <div className="border-t pt-4">
        {fileStructure.children.map(item => (
          <FileTreeItem key={item.id} item={item} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;