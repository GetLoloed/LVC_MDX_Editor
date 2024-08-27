import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FileTree from './components/FileTree'
import MarkdownEditor from './components/MarkdownEditor'
import MarkdownPreview from './components/MarkdownPreview'
import BlockLibrary from './components/BlockLibrary'
import ImportButton from './components/ImportButton'
import SaveButton from './components/SaveButton'
import ExportButton from './components/ExportButton'
import { createFolder, renameFolder, deleteFolder, createFile, renameFile, deleteFile, moveItem } from './utils/fileManager'
import { loadFromLocalStorage, saveToLocalStorage } from './utils/localStorage'
import './styles/App.css'

const STORAGE_KEY = 'markdownEditorState'

function App() {
  const [fileStructure, setFileStructure] = useState(() =>
    loadFromLocalStorage(STORAGE_KEY, {
      id: 'root',
      name: 'Racine',
      type: 'folder',
      children: []
    })
  )
  const [selectedFile, setSelectedFile] = useState(null)
  const [markdownContent, setMarkdownContent] = useState('')
  const [customBlocks, setCustomBlocks] = useState(() =>
    loadFromLocalStorage('customBlocks', [])
  )

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, fileStructure)
  }, [fileStructure])

  useEffect(() => {
    saveToLocalStorage('customBlocks', customBlocks)
  }, [customBlocks])

  const handleCreateFolder = (parentId, folderName) => {
    setFileStructure(prevStructure => createFolder(prevStructure, parentId, folderName))
    toast.success(`Dossier "${folderName}" créé avec succès`)
  }

  const handleRenameFolder = (folderId, newName) => {
    setFileStructure(prevStructure => renameFolder(prevStructure, folderId, newName))
    toast.info(`Dossier renommé en "${newName}"`)
  }

  const handleDeleteFolder = (folderId) => {
    setFileStructure(prevStructure => deleteFolder(prevStructure, folderId))
    if (selectedFile && selectedFile.id === folderId) {
      setSelectedFile(null)
      setMarkdownContent('')
    }
    toast.warn('Dossier supprimé')
  }

  const handleCreateFile = (parentId, fileName) => {
    setFileStructure(prevStructure => createFile(prevStructure, parentId, fileName))
    toast.success(`Fichier "${fileName}" créé avec succès`)
  }

  const handleRenameFile = (fileId, newName) => {
    setFileStructure(prevStructure => renameFile(prevStructure, fileId, newName))
    toast.info(`Fichier renommé en "${newName}"`)
  }

  const handleDeleteFile = (fileId) => {
    setFileStructure(prevStructure => deleteFile(prevStructure, fileId))
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null)
      setMarkdownContent('')
    }
    toast.warn('Fichier supprimé')
  }

  const handleMoveItem = (itemId, targetId) => {
    setFileStructure(prevStructure => moveItem(prevStructure, itemId, targetId))
    toast.info('Élément déplacé avec succès')
  }

  const handleSelectFile = (fileId) => {
    const findFile = (structure, id) => {
      if (structure.id === id) return structure
      if (structure.children) {
        for (let child of structure.children) {
          const found = findFile(child, id)
          if (found) return found
        }
      }
      return null
    }

    const file = findFile(fileStructure, fileId)
    if (file && file.type === 'file') {
      setSelectedFile(file)
      setMarkdownContent(file.content || '')
      toast.info(`Fichier "${file.name}" sélectionné`)
    }
  }

  const handleContentChange = (newContent) => {
    setMarkdownContent(newContent)
    if (selectedFile) {
      setFileStructure(prevStructure => {
        const updateFileContent = (structure, id, content) => {
          if (structure.id === id) {
            return { ...structure, content }
          }
          if (structure.children) {
            return {
              ...structure,
              children: structure.children.map(child => updateFileContent(child, id, content))
            }
          }
          return structure
        }
        return updateFileContent(prevStructure, selectedFile.id, newContent)
      })
      toast.success('Contenu mis à jour', { autoClose: 1000 })
    }
  }

  const handleSave = () => {
    // La sauvegarde se fait automatiquement grâce à l'effet useEffect
    toast.success('Fichier sauvegardé avec succès')
  }

  const handleExport = () => {
    if (selectedFile) {
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedFile.name}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Fichier "${selectedFile.name}" exporté avec succès`)
    } else {
      toast.error('Aucun fichier sélectionné pour l\'export')
    }
  }

  const handleImport = (fileName, content) => {
    const newFileId = Math.random().toString(36).substr(2, 9)
    setFileStructure(prevStructure => ({
      ...prevStructure,
      children: [
        ...prevStructure.children,
        { id: newFileId, name: fileName, type: 'file', content }
      ]
    }))
    toast.success(`Fichier "${fileName}" importé avec succès`)
  }

  const handleCustomBlocksChange = (newBlocks) => {
    setCustomBlocks(newBlocks)
    // La sauvegarde dans le localStorage se fait automatiquement grâce à l'effet useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Markdown Editor</h1>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-full md:w-1/4 lg:w-1/5 bg-white shadow-md overflow-y-auto">
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
          <Link to="/block-library" className="block mt-4 mx-4 text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200">
            Bibliothèque de blocs
          </Link>
        </aside>
        <main className="flex-grow overflow-hidden">
          <Routes>
            <Route path="/" element={
              <div className="h-full flex flex-col">
                <div className="bg-white shadow-sm p-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{selectedFile ? selectedFile.name : 'Aucun fichier sélectionné'}</h2>
                  <div className="space-x-2">
                    <ImportButton onImport={handleImport} />
                    <SaveButton onClick={handleSave} disabled={!selectedFile} />
                    <ExportButton onClick={handleExport} disabled={!selectedFile} />
                  </div>
                </div>
                <div className="flex-grow overflow-hidden p-4">
                  <MarkdownEditor
                    content={markdownContent}
                    onContentChange={handleContentChange}
                    customBlocks={customBlocks}
                    onCustomBlocksChange={handleCustomBlocksChange}
                  />
                </div>
              </div>
            } />
            <Route path="/block-library" element={<BlockLibrary />} />
          </Routes>
        </main>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  )
}

export default App