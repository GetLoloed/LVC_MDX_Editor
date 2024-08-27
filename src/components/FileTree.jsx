import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FaFolder, FaFile, FaFolderPlus, FaFileMedical, FaPen, FaTrash } from 'react-icons/fa'

const FileTree = ({ structure, onCreateFolder, onRenameFolder, onDeleteFolder, onCreateFile, onRenameFile, onDeleteFile, onMoveItem, onSelectFile }) => {
  const [draggedItem, setDraggedItem] = useState(null)

  const handleDragStart = (e, item) => {
    e.stopPropagation()
    setDraggedItem(item)
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }

  const handleDragOver = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    if (item.type === 'folder') {
      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
    }
  }

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = ''
  }

  const handleDrop = (e, targetItem) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.style.backgroundColor = ''

    if (!draggedItem || draggedItem.id === targetItem.id) return

    if (targetItem.type === 'folder') {
      onMoveItem(draggedItem.id, targetItem.id)
    } else {
      // Si on dépose sur un fichier, on déplace dans le même dossier parent
      onMoveItem(draggedItem.id, targetItem.parentId)
    }

    setDraggedItem(null)
  }

  const renderItem = (item, parentId = null) => {
    if (!item) return null;

    const isRoot = item.id === 'root';

    return (
      <li
        key={item.id}
        className="py-1"
        draggable={!isRoot}
        onDragStart={(e) => handleDragStart(e, { ...item, parentId })}
        onDragOver={(e) => handleDragOver(e, item)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, { ...item, parentId })}
      >
        <div className="flex items-center">
          {item.type === 'folder' ? (
            <>
              <FaFolder className="mr-2 text-yellow-500" />
              <button className="text-left" onClick={() => onSelectFile(item.id)}>{item.name}</button>
              {item.type === 'folder' && (
                <>
                  <button onClick={() => onCreateFolder(item.id, prompt('Nom du nouveau dossier:'))} className="ml-2">
                    <FaFolderPlus className="text-green-500" />
                  </button>
                  <button onClick={() => onCreateFile(item.id, prompt('Nom du nouveau fichier:'))} className="ml-2">
                    <FaFileMedical className="text-blue-500" />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <FaFile className="mr-2 text-gray-500" />
              <button className="text-left" onClick={() => onSelectFile(item.id)}>{item.name}</button>
            </>
          )}
          {!isRoot && (
            <>
              <button onClick={() => item.type === 'folder' ? onRenameFolder(item.id, prompt('Nouveau nom:')) : onRenameFile(item.id, prompt('Nouveau nom:'))} className="ml-2">
                <FaPen className="text-yellow-500" />
              </button>
              <button onClick={() => item.type === 'folder' ? onDeleteFolder(item.id) : onDeleteFile(item.id)} className="ml-2">
                <FaTrash className="text-red-500" />
              </button>
            </>
          )}
        </div>
        {item.type === 'folder' && item.children && (
          <ul className="pl-4">
            {item.children.map(child => renderItem(child, item.id))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="bg-gray-100 p-4 h-full overflow-y-auto">
      <ul className="space-y-2">
        {renderItem(structure)}
      </ul>
    </div>
  )
}

FileTree.propTypes = {
  structure: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['folder', 'file']).isRequired,
    children: PropTypes.array
  }).isRequired,
  onCreateFolder: PropTypes.func.isRequired,
  onRenameFolder: PropTypes.func.isRequired,
  onDeleteFolder: PropTypes.func.isRequired,
  onCreateFile: PropTypes.func.isRequired,
  onRenameFile: PropTypes.func.isRequired,
  onDeleteFile: PropTypes.func.isRequired,
  onMoveItem: PropTypes.func.isRequired,
  onSelectFile: PropTypes.func.isRequired
}

export default FileTree