import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileExplorer from '../components/FileExplorer';
import MarkdownEditor from '../components/MarkdownEditor';
import { FaFolderOpen, FaTimes } from 'react-icons/fa';

function HomePage() {
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false);

  const toggleFileExplorer = () => {
    setIsFileExplorerOpen(!isFileExplorerOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <button
          onClick={toggleFileExplorer}
          className="md:hidden absolute top-2 left-2 z-10 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
        >
          {isFileExplorerOpen ? <FaTimes className="mr-2" /> : <FaFolderOpen className="mr-2" />}
          {isFileExplorerOpen ? 'Fermer' : 'Fichiers'}
        </button>
        <div className={`${isFileExplorerOpen ? 'absolute inset-0 z-20' : 'hidden'} md:relative md:block w-full md:w-1/4 bg-gray-800 transition-all duration-300 ease-in-out`}>
          <FileExplorer className="h-full p-4 overflow-y-auto" />
        </div>
        <MarkdownEditor className={`w-full ${isFileExplorerOpen ? 'hidden' : 'flex'} md:flex md:flex-1`} />
      </div>
    </div>
  );
}

export default HomePage;