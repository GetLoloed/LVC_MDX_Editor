import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectFileStructure, selectImages, selectBlocs } from './utils/selector';
import { ajouterImage } from './features/bibliotheque';
import { ajouterFichier, modifierFichier } from './features/fileStructureSlice';
import FileTree from './components/FileTree';
import { FaBars, FaTimes, FaImages, FaCubes, FaSave, FaFileExport, FaFileImport } from 'react-icons/fa';
import showdown from 'showdown';
import './styles/App.css';

function App() {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  const fileStructure = useSelector(selectFileStructure);
  const images = useSelector(selectImages);
  const blocs = useSelector(selectBlocs);

  const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
    parseImgDimensions: true,
    encodeEmails: false
  });

  useEffect(() => {
    const html = converter.makeHtml(markdownContent);
    setHtmlContent(html);
  }, [markdownContent]);

  useEffect(() => {
    const savedState = localStorage.getItem('reduxState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.blocs) {
        dispatch({ type: 'INITIALIZE_STATE', payload: parsedState });
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const savedFileStructure = localStorage.getItem('fileStructure');
    if (savedFileStructure) {
      const parsedFileStructure = JSON.parse(savedFileStructure);
      dispatch({ type: 'fileStructure/setFileStructure', payload: parsedFileStructure });
    }
  }, [dispatch]);

  useEffect(() => {
    const storedImages = localStorage.getItem('bibliothequeImages');
    if (storedImages) {
      try {
        const parsedImages = JSON.parse(storedImages);
        parsedImages.forEach(image => dispatch(ajouterImage(image)));
      } catch (error) {
        console.error('Erreur lors du parsing des images:', error);
      }
    }
  }, [dispatch]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setMarkdownContent(file.content || '');
  };

  const handleMarkdownChange = (e) => {
    setMarkdownContent(e.target.value);
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  const insertImageToMarkdown = (image) => {
    const truncatedUrl = image.url.length > 50 ? image.url.substring(0, 50) + '...' : image.url;
    const imageMarkdown = `![${image.nom}](${truncatedUrl})`;
    setMarkdownContent(prevContent => prevContent + '\n' + imageMarkdown);
  };

  const insertBlocToMarkdown = (bloc) => {
    setMarkdownContent(prevContent => prevContent + '\n' + bloc.contenu);
  };

  const handleSave = () => {
    if (selectedFile) {
      dispatch(modifierFichier({ id: selectedFile.id, content: markdownContent }));
      alert('Fichier sauvegardé avec succès !');
    } else {
      alert('Aucun fichier sélectionné');
    }
  };

  const handleExport = () => {
    if (selectedFile) {
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('Aucun fichier sélectionné');
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          type: 'file',
          content: content,
        };

        dispatch(ajouterFichier(newFile));
        setMarkdownContent(content);
        setSelectedFile(newFile);

        const currentState = JSON.parse(localStorage.getItem('reduxState') || '{}');
        const updatedState = {
          ...currentState,
          fileStructure: {
            ...currentState.fileStructure,
            root: {
              ...currentState.fileStructure.root,
              children: [...(currentState.fileStructure.root.children || []), newFile],
            },
          },
        };
        localStorage.setItem('reduxState', JSON.stringify(updatedState));

        alert('Fichier importé et sauvegardé avec succès !');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${leftSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        {leftSidebarOpen && (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fichiers Markdown</h2>
            <FileTree fileStructure={fileStructure} onFileSelect={handleFileSelect} />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={toggleLeftSidebar}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              {leftSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Éditeur Markdown</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                <FaSave className="inline-block mr-2" /> Sauvegarder
              </button>
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <FaFileExport className="inline-block mr-2" /> Exporter
              </button>
              <label className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded cursor-pointer">
                <FaFileImport className="inline-block mr-2" /> Importer
                <input
                  type="file"
                  accept=".md"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={toggleRightSidebar}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                {rightSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 flex">
          <div className="flex-1">
            {selectedFile ? (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedFile.name}</h2>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <textarea
                      className="w-full h-[calc(100vh-250px)] p-2 border rounded resize-none font-mono"
                      value={markdownContent}
                      onChange={handleMarkdownChange}
                      placeholder="Écrivez votre contenu Markdown ici..."
                    />
                  </div>
                  <div className="w-1/2">
                    <div
                      className="w-full h-[calc(100vh-250px)] p-2 border rounded overflow-y-auto prose"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-6 text-center">
                <p className="text-xl text-gray-600">Sélectionnez un fichier pour commencer l'édition</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${rightSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        {rightSidebarOpen && (
          <div className="p-4 flex flex-col h-full">
            <div className="flex space-x-2 mb-4">
              <Link
                to="/bibliotheque"
                className="flex-1 flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out"
              >
                <FaImages className="mr-2" />
                Bibliothèque
              </Link>
              <Link
                to="/blocs"
                className="flex-1 flex items-center justify-center p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 ease-in-out"
              >
                <FaCubes className="mr-2" />
                Blocs
              </Link>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Blocs personnalisés</h2>
            <div className="overflow-y-auto flex-grow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Blocs</h3>
              <div className="space-y-2">
                {Array.isArray(blocs) && blocs.length > 0 ? (
                  blocs.map((bloc) => (
                    <div
                      key={bloc.id}
                      className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors duration-150"
                      onClick={() => insertBlocToMarkdown(bloc)}
                    >
                      <h4 className="font-medium text-gray-800">{bloc.nom}</h4>
                      <p className="text-sm text-gray-600 truncate">{bloc.contenu.substring(0, 50)}...</p>
                    </div>
                  ))
                ) : (
                  <p>Aucun bloc disponible</p>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {Array.isArray(images) && images.map((image) => (
                  <div
                    key={image.id}
                    className="cursor-pointer hover:opacity-75 transition-opacity duration-150"
                    onClick={() => insertImageToMarkdown(image)}
                  >
                    <img src={image.url} alt={image.nom} className="w-full h-20 object-cover rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;