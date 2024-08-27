import React, { useState } from 'react'
import { FaFolder, FaFile, FaFolderPlus, FaFileMedical, FaPen, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'

const FileTree = ({ structure, onCreateFolder, onRenameFolder, onDeleteFolder, onCreateFile, onRenameFile, onDeleteFile, onMoveItem }) => {
  const [newItemName, setNewItemName] = useState('')
  const [creatingIn, setCreatingIn] = useState(null)
  const [creatingType, setCreatingType] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)

  const handleCreateItem = (parentId, type) => {
    setCreatingIn(parentId)
    setCreatingType(type)
    setNewItemName('')
  }

  const handleSubmitNewItem = () => {
    if (newItemName) {
      if (creatingType === 'folder') {
        onCreateFolder(creatingIn, newItemName)
      } else {
        onCreateFile(creatingIn, newItemName)
      }
      setCreatingIn(null)
      setCreatingType(null)
      setNewItemName('')
    }
  }

  const handleCancelCreate = () => {
    setCreatingIn(null)
    setCreatingType(null)
    setNewItemName('')
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.setData('text/plain', item.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetItem) => {
    e.preventDefault()
    if (draggedItem && draggedItem.id !== targetItem.id) {
      onMoveItem(draggedItem.id, targetItem.id)
    }
    setDraggedItem(null)
  }

  const renderItem = (item) => (
    <li
      key={item.id}
      className="py-1"
      draggable={true}
      onDragStart={(e) => handleDragStart(e, item)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, item)}
    >
      <div className="flex items-center">
        {item.type === 'folder' ? (
          <>
            <FaFolder className="mr-2 text-yellow-500" />
            <span className="flex-grow">{item.name}</span>
            <button onClick={() => handleCreateItem(item.id, 'folder')} className="p-1" title="Nouveau dossier">
              <FaFolderPlus className="text-green-500" />
            </button>
            <button onClick={() => handleCreateItem(item.id, 'file')} className="p-1" title="Nouveau fichier">
              <FaFileMedical className="text-blue-500" />
            </button>
            <button onClick={() => onRenameFolder(item.id, prompt('Nouveau nom:', item.name))} className="p-1" title="Renommer">
              <FaPen className="text-gray-500" />
            </button>
            <button onClick={() => onDeleteFolder(item.id)} className="p-1" title="Supprimer">
              <FaTrash className="text-red-500" />
            </button>
          </>
        ) : (
          <>
            <FaFile className="mr-2 text-gray-500" />
            <span className="flex-grow">{item.name}</span>
            <button onClick={() => onRenameFile(item.id, prompt('Nouveau nom:', item.name))} className="p-1" title="Renommer">
              <FaPen className="text-gray-500" />
            </button>
            <button onClick={() => onDeleteFile(item.id)} className="p-1" title="Supprimer">
              <FaTrash className="text-red-500" />
            </button>
          </>
        )}
      </div>
      {item.type === 'folder' && (
        <ul className="pl-4">
          {creatingIn === item.id && (
            <li className="py-1">
              <div className="flex items-center">
                {creatingType === 'folder' ? <FaFolder className="mr-2 text-yellow-500" /> : <FaFile className="mr-2 text-gray-500" />}
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Nom du nouveau ${creatingType === 'folder' ? 'dossier' : 'fichier'}`}
                  className="flex-grow p-1 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitNewItem()}
                />
                <button onClick={handleSubmitNewItem} className="p-1" title="Confirmer">
                  <FaCheck className="text-green-500" />
                </button>
                <button onClick={handleCancelCreate} className="p-1" title="Annuler">
                  <FaTimes className="text-red-500" />
                </button>
              </div>
            </li>
          )}
          {item.children.map(renderItem)}
        </ul>
      )}
    </li>
  )

  return (
    <div
      className="bg-gray-100 p-4 h-full overflow-y-auto"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, structure)}
    >
      <ul className="space-y-2">
        {renderItem(structure)}
      </ul>
    </div>
  )
}

export default FileTree