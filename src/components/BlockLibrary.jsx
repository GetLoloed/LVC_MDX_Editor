import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import CustomBlock from './CustomBlock';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

const BlockLibrary = () => {
  const [customBlocks, setCustomBlocks] = useState([]);
  const [newBlockName, setNewBlockName] = useState('');

  useEffect(() => {
    const savedBlocks = loadFromLocalStorage('customBlocks', []);
    setCustomBlocks(savedBlocks);
  }, []);

  const saveBlocks = (blocks) => {
    setCustomBlocks(blocks);
    saveToLocalStorage('customBlocks', blocks);
  };

  const handleCreateBlock = () => {
    if (newBlockName.trim()) {
      const newBlock = {
        id: Date.now(),
        name: newBlockName,
        content: '# Nouveau bloc personnalisé\n\nContenu du bloc...'
      };
      saveBlocks([...customBlocks, newBlock]);
      setNewBlockName('');
    }
  };

  const handleUpdateBlock = (updatedBlock) => {
    const updatedBlocks = customBlocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    saveBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (blockId) => {
    const updatedBlocks = customBlocks.filter(block => block.id !== blockId);
    saveBlocks(updatedBlocks);
  };

  const handleRenameBlock = (blockId, newName) => {
    const updatedBlocks = customBlocks.map(block =>
      block.id === blockId ? { ...block, name: newName } : block
    );
    saveBlocks(updatedBlocks);
  };

  const handleExportBlock = (block) => {
    const blob = new Blob([JSON.stringify(block)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${block.name}.part.mdlc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAllBlocks = () => {
    const blob = new Blob([JSON.stringify(customBlocks)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_blocks.par.ts.mdlc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBlocks = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          if (Array.isArray(content)) {
            saveBlocks([...customBlocks, ...content]);
          } else {
            saveBlocks([...customBlocks, content]);
          }
        } catch (error) {
          console.error('Erreur lors de l\'importation du fichier:', error);
          // Ajouter une notification d'erreur ici
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bibliothèque de blocs personnalisés</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newBlockName}
          onChange={(e) => setNewBlockName(e.target.value)}
          placeholder="Nom du nouveau bloc"
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleCreateBlock} className="bg-green-500 text-white px-4 py-2 rounded">
          Créer un nouveau bloc
        </button>
      </div>
      <div className="mb-4">
        <button onClick={handleExportAllBlocks} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Exporter tous les blocs
        </button>
        <label className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer">
          Importer des blocs
          <input
            type="file"
            accept=".part.mdlc,.par.ts.mdlc"
            onChange={handleImportBlocks}
            className="hidden"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customBlocks.map(block => (
          <div key={block.id} className="border p-4 rounded">
            <h2 className="text-xl font-bold mb-2">{block.name}</h2>
            <CustomBlock
              block={block}
              onSave={handleUpdateBlock}
              onDelete={() => handleDeleteBlock(block.id)}
            />
            <div className="mt-2 flex justify-between">
              <button onClick={() => handleRenameBlock(block.id, prompt('Nouveau nom:', block.name))} className="text-yellow-500">
                <FaEdit />
              </button>
              <button onClick={() => handleExportBlock(block)} className="text-blue-500">
                <FaDownload />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockLibrary;