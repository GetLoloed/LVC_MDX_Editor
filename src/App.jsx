import React, { useState, useRef, useEffect } from 'react'
import './styles/App.css'
import FileTree from './components/FileTree'
import MarkdownEditor from './components/MarkdownEditor'
import MarkdownPreview from './components/MarkdownPreview'
import { createFolder, renameFolder, deleteFolder, createFile, renameFile, deleteFile, moveItem } from './utils/fileManager'

function App() {
  const [fileStructure, setFileStructure] = useState({
    id: 'root',
    name: 'Racine',
    type: 'folder',
    children: []
  })
  const [sidebarWidth, setSidebarWidth] = useState(300) // Largeur initiale en pixels
  const [selectedFile, setSelectedFile] = useState(null)
  const [markdownContent, setMarkdownContent] = useState('')
  const sidebarRef = useRef(null)
  const resizerRef = useRef(null)

  useEffect(() => {
    const resizer = resizerRef.current
    let x = 0
    let w = 0

    function mouseMoveHandler(e) {
      const dx = e.clientX - x
      const newWidth = w + dx
      if (newWidth > 100 && newWidth < window.innerWidth - 100) {
        setSidebarWidth(newWidth)
      }
    }

    function mouseUpHandler() {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }

    function mouseDownHandler(e) {
      x = e.clientX
      w = sidebarRef.current.getBoundingClientRect().width
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    resizer.addEventListener('mousedown', mouseDownHandler)

    return () => {
      resizer.removeEventListener('mousedown', mouseDownHandler)
    }
  }, [])

  const handleCreateFolder = (parentId, name) => {
    setFileStructure(prevStructure => createFolder(prevStructure, parentId, name))
  }

  const handleRenameFolder = (folderId, newName) => {
    setFileStructure(prevStructure => renameFolder(prevStructure, folderId, newName))
  }

  const handleDeleteFolder = (folderId) => {
    setFileStructure(prevStructure => deleteFolder(prevStructure, folderId))
  }

  const handleCreateFile = (parentId, name) => {
    setFileStructure(prevStructure => createFile(prevStructure, parentId, name))
  }

  const handleRenameFile = (fileId, newName) => {
    setFileStructure(prevStructure => renameFile(prevStructure, fileId, newName))
  }

  const handleDeleteFile = (fileId) => {
    setFileStructure(prevStructure => deleteFile(prevStructure, fileId))
  }

  const handleMoveItem = (itemId, targetId) => {
    setFileStructure(prevStructure => moveItem(prevStructure, itemId, targetId))
  }

  const handleSelectFile = (fileId) => {
    const file = findFileById(fileStructure, fileId)
    if (file && file.type === 'file') {
      setSelectedFile(file)
      setMarkdownContent(file.content || '')
    }
  }

  const handleContentChange = (newContent) => {
    setMarkdownContent(newContent)
    if (selectedFile) {
      setFileStructure(prevStructure =>
        updateFileContent(prevStructure, selectedFile.id, newContent)
      )
    }
  }

  const findFileById = (structure, id) => {
    if (structure.id === id) return structure
    if (structure.type === 'folder') {
      for (let child of structure.children) {
        const found = findFileById(child, id)
        if (found) return found
      }
    }
    return null
  }

  const updateFileContent = (structure, fileId, newContent) => {
    if (structure.id === fileId && structure.type === 'file') {
      return { ...structure, content: newContent }
    }
    if (structure.type === 'folder') {
      return {
        ...structure,
        children: structure.children.map(child => updateFileContent(child, fileId, newContent))
      }
    }
    return structure
  }

  return (
    <div className="flex h-screen">
      <div ref={sidebarRef} style={{ width: `${sidebarWidth}px` }} className="relative border-r">
        <FileTree
          structure={fileStructure}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onMoveItem={handleMoveItem}
          onSelectFile={handleSelectFile}
        />
        <div
          ref={resizerRef}
          className="absolute top-0 right-0 w-1 h-full bg-gray-300 cursor-col-resize hover:bg-gray-400"
        />
      </div>
      <div className="flex-grow flex">
        <div className="w-1/2 p-4">
          <MarkdownEditor
            content={markdownContent}
            onContentChange={handleContentChange}
          />
        </div>
        <div className="w-1/2 p-4">
          <MarkdownPreview content={markdownContent} />
        </div>
      </div>
    </div>
  )
}

export default App
