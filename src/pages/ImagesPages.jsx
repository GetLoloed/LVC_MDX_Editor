import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import DragDropZone from '../components/DragDropZone';
import ActionButtons from '../components/ActionButtons';
import { ajouterImage, supprimerImage, renommerImage } from '../redux/actions/imagesActions';
import { FaTrash, FaFileDownload, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { useFileExport } from '../hooks/useFileExport';
import { useSelection } from '../hooks/useSelection';

function ImagesPage() {
  const images = useSelector(state => state.images.images);
  const dispatch = useDispatch();
  const { exportImage, exportImages, isExporting } = useFileExport();
  const { selectedItems: selectedImages, toggleSelectItem: toggleSelectImage, toggleSelectAll } = useSelection(images);

  const handleAjouterImage = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nouvelleImage = {
          id: Date.now(),
          nom: file.name,
          data: reader.result.split(',')[1]
        };
        dispatch(ajouterImage(nouvelleImage));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSupprimerImage = (id) => {
    dispatch(supprimerImage(id));
    toggleSelectImage(id);
  };

  const handleRenommerImage = (id, nom) => {
    if (nom.trim()) {
      dispatch(renommerImage(id, nom));
    }
  };

  const handleExportImage = (image) => {
    exportImage(image);
  };

  const handleExportSelectedImages = () => {
    const imagesToExport = images.filter(img => selectedImages.includes(img.id));
    exportImages(imagesToExport);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="flex-1 p-4 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Bibliothèque d'images</h1>
        <DragDropZone
          onDrop={handleAjouterImage}
          acceptedFileTypes="image/*"
        >
          Glissez et déposez vos images ici ou cliquez pour sélectionner
        </DragDropZone>
        <ActionButtons
          onToggleSelectAll={toggleSelectAll}
          onExportItems={handleExportSelectedImages}
          isAllSelected={selectedImages.length === images.length}
          isExporting={isExporting}
          exportDisabled={selectedImages.length === 0}
          showCreateButton={false} // Nouveau prop pour cacher le bouton de création
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {images.map(image => (
            <div key={image.id} className="bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={`data:image/jpeg;base64,${image.data}`}
                  alt={image.nom}
                  className="w-full h-32 object-cover"
                />
                <div
                  className="absolute top-2 left-2 cursor-pointer"
                  onClick={() => toggleSelectImage(image.id)}
                >
                  {selectedImages.includes(image.id) ? (
                    <FaCheckSquare className="text-blue-500 text-2xl" />
                  ) : (
                    <FaSquare className="text-gray-300 text-2xl" />
                  )}
                </div>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  defaultValue={image.nom}
                  onChange={(e) => handleRenommerImage(image.id, e.target.value)}
                  className="w-full mb-2 px-2 py-1 border rounded text-sm bg-gray-700 text-white"
                />
                <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleSupprimerImage(image.id)}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs transition duration-300 flex items-center justify-center"
                  >
                    <FaTrash className="mr-1" /> Supprimer
                  </button>
                  <button
                    onClick={() => handleExportImage(image)}
                    className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-1 px-2 rounded text-xs transition duration-300 flex items-center justify-center"
                    disabled={isExporting}
                  >
                    <FaFileDownload className="mr-1" />
                    {isExporting ? 'Exportation...' : 'Exporter'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImagesPage;