import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AiOutlineUpload, AiOutlineDownload, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { fetchImages, addImage, deleteImage, updateImage } from '../store/imageSlice';

function ImageManager() {
  const dispatch = useDispatch();
  const { images, status } = useSelector((state) => state.images);
  const currentWorkspace = useSelector(state => state.auth.currentWorkspace);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newName, setNewName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Permet de charger les images lorsque l'espace de travail change
  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchImages(currentWorkspace.id));
    }
  }, [dispatch, currentWorkspace]);

  // Gestion du téléchargement de fichiers
  const handleFileUpload = (event) => {
    const files = event.target.files;
    handleMultipleFileUpload(files);
  };

  // Traitement de plusieurs fichiers téléchargés
  const handleMultipleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          dispatch(addImage({ name: file.name, data: base64 }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Gestion du glisser-déposer de fichiers
  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleMultipleFileUpload(files);
  };

  // Empêche le comportement par défaut lors du survol d'un élément avec un fichier
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Suppression d'une image
  const handleDelete = (id) => {
    dispatch(deleteImage(id));
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  // Renommage d'une image
  const handleRename = (id) => {
    if (newName.trim() && selectedImage) {
      dispatch(updateImage({ ...selectedImage, name: newName }))
        .then(() => {
          setSelectedImage(prev => ({ ...prev, name: newName }));
          setNewName('');
          setIsModalOpen(false);
        });
    }
  };

  // Exportation d'une seule image
  const handleExport = (id) => {
    const image = images.find(img => img.id === id);
    if (image) {
      const blob = new Blob([JSON.stringify(image)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.name}.img.mdlc`;
      a.click();
    }
  };

  // Exportation de toutes les images
  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(images)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'images.imgs.mdlc';
    a.click();
  };

  // Importation d'images
  const handleImport = (event) => {
    const files = event.target.files;
    Array.from(files).forEach(handleFile);
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => handleFileContent(file, e.target.result);
    chooseReadMethod(file, reader);
  };

  const handleFileContent = (file, content) => {
    try {
      if (file.name.endsWith('.img.mdlc') || file.name.endsWith('.imgs.mdlc')) {
        handleMdlcFile(content);
      } else if (file.type.startsWith('image/')) {
        dispatch(addImage({ name: file.name, data: content }));
      } else {
        console.error('Type de fichier non pris en charge:', file.type);
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation du fichier:', error);
    }
  };

  const handleMdlcFile = (content) => {
    const parsedContent = JSON.parse(content);
    if (Array.isArray(parsedContent)) {
      parsedContent.forEach(img => dispatch(addImage(img)));
    } else {
      dispatch(addImage(parsedContent));
    }
  };

  const chooseReadMethod = (file, reader) => {
    if (file.name.endsWith('.img.mdlc') || file.name.endsWith('.imgs.mdlc')) {
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-bg text-obsidian-text p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionnaire d'images</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => document.getElementById('fileUpload').click()}
          className="bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 flex items-center justify-center"
        >
          <AiOutlineUpload className="mr-2" />
          <span>Ajouter des images</span>
        </button>
        <button
          onClick={handleExportAll}
          className="bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 flex items-center justify-center"
        >
          <AiOutlineDownload className="mr-2" />
          <span>Exporter toutes</span>
        </button>
        <label className="bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 cursor-pointer flex items-center justify-center">
          <AiOutlineUpload className="mr-2" />
          <span>Importer des images</span>
          <input
            id="fileUpload"
            type="file"
            onChange={handleImport}
            accept=".img.mdlc,.imgs.mdlc,image/*"
            className="hidden"
            multiple
          />
        </label>
      </div>
      <div
        className="flex-grow overflow-auto p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-obsidian-hover rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col transform hover:z-10"
              onClick={() => {
                setSelectedImage(image);
                setIsModalOpen(true);
              }}
            >
              <div className="aspect-w-16 aspect-h-9 bg-obsidian-bg rounded-t-lg overflow-hidden">
                <img
                  src={image.data}
                  alt={image.name}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-3 bg-obsidian-bg rounded-b-lg">
                <p className="text-sm font-medium truncate text-obsidian-text">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-bg rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-full overflow-auto">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={selectedImage.data}
                alt={selectedImage.name}
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouveau nom"
              className="w-full mb-4 bg-obsidian-hover border border-obsidian-border rounded px-2 py-1"
            />
            <div className="flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => handleRename(selectedImage.id)}
                className="bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 flex items-center justify-center"
              >
                <AiOutlineEdit className="mr-2" />
                <span>Renommer</span>
              </button>
              <button
                onClick={() => handleExport(selectedImage.id)}
                className="bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 flex items-center justify-center"
              >
                <AiOutlineDownload className="mr-2" />
                <span>Exporter</span>
              </button>
              <button
                onClick={() => handleDelete(selectedImage.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-opacity-80 flex items-center justify-center"
              >
                <AiOutlineDelete className="mr-2" />
                <span>Supprimer</span>
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full bg-obsidian-hover text-obsidian-text px-4 py-2 rounded hover:bg-opacity-80"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageManager;