import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ajouterImage, deplacerImage, selectionnerImage, deselectionnerImage, supprimerImage, renommerImage } from '../../features/bibliotheque';
import { selectImages, selectSelectedImage } from '../../utils/selector';
import CryptoJS from 'crypto-js';
import { Link } from 'react-router-dom';

const Bibliotheque = () => {
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
  const dispatch = useDispatch();
  const images = useSelector(selectImages);
  const selectedImage = useSelector(selectSelectedImage);
  const [draggedImage, setDraggedImage] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [newImageName, setNewImageName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedImages = localStorage.getItem('bibliothequeImages');
    if (storedImages) {
      const parsedImages = JSON.parse(storedImages);
      parsedImages.forEach(image => {
        const imageExists = images.some(img => img.base64 === image.base64);
        if (!imageExists) {
          dispatch(ajouterImage(image));
        }
      });
    }
  }, [dispatch, images]);

  useEffect(() => {
    const uniqueImages = images.filter((image, index, self) =>
      index === self.findIndex((t) => t.base64 === image.base64)
    );
    localStorage.setItem('bibliothequeImages', JSON.stringify(uniqueImages));
  }, [images]);

  const handleDragStart = (e, image, index) => {
    setDraggedImage({ image, index });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedImage) {
      dispatch(deplacerImage({ sourceIndex: draggedImage.index, targetIndex }));
      setDraggedImage(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        const imageExists = images.some(img => img.base64 === base64Image);
        if (!imageExists) {
          dispatch(ajouterImage({ base64: base64Image, nom: file.name, id: Date.now() }));
        } else {
          setErrorMessage("Cette image existe déjà dans la bibliothèque.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (image) => {
    if (selectedImage && selectedImage.id === image.id) {
      dispatch(deselectionnerImage());
    } else {
      dispatch(selectionnerImage(image));
    }
  };

  const handleDeleteImage = (imageId) => {
    dispatch(supprimerImage(imageId));
  };

  const handleRenameClick = (imageId, currentName) => {
    setEditingImageId(imageId);
    setNewImageName(currentName);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (editingImageId && newImageName.trim()) {
      dispatch(renommerImage({ imageId: editingImageId, nouveauNom: newImageName.trim() }));
      setEditingImageId(null);
      setNewImageName('');
    }
  };

  const encryptData = (data) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    return encryptedData;
  };

  const decryptData = (encryptedData) => {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (error) {
      setErrorMessage("Erreur de décryptage. Vérifiez votre clé d'encryption.");
      throw error;
    }
  };

  const handleExportImage = (image) => {
    const encryptedImage = encryptData(image);
    const blob = new Blob([encryptedImage], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.nom}.img.mdlc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAllImages = () => {
    const encryptedImageList = encryptData(images);
    const blob = new Blob([encryptedImageList], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste_images.img.mdlc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportAllImages = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const encryptedData = event.target.result;
          const decryptedData = decryptData(encryptedData);
          console.log(decryptedData);
          if (Array.isArray(decryptedData)) {
            decryptedData.forEach(image => {
              const imageExists = images.some(img => img.base64 === image.base64);
              if (!imageExists) {
                dispatch(ajouterImage(image));
              }
            });
            setErrorMessage("Images importées avec succès. Les doublons ont été ignorés.");
          } else {
            setErrorMessage("Le fichier importé ne contient pas un tableau d'images valide.");
          }
        } catch (error) {
          console.error("Erreur lors de l'importation des images:", error);
          setErrorMessage("Erreur lors de l'importation des images. Vérifiez votre clé d'encryption.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const encryptedData = event.target.result;
          const decryptedImage = decryptData(encryptedData);
          const imageExists = images.some(img => img.base64 === decryptedImage.base64);
          if (!imageExists) {
            dispatch(ajouterImage(decryptedImage));
            setErrorMessage("Image importée avec succès.");
          } else {
            setErrorMessage("Cette image existe déjà dans la bibliothèque.");
          }
        } catch (error) {
          console.error("Erreur lors de l'importation de l'image:", error);
          setErrorMessage("Erreur lors de l'importation de l'image. Vérifiez votre clé d'encryption.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Bibliothèque d&apos;images</h1>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage('')}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out">
            Retour à l&apos;accueil
          </Link>

          <label htmlFor="file-upload" className="cursor-pointer bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out mr-2">
            Ajouter une image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <label htmlFor="import-image" className="cursor-pointer bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out mr-2">
            Importer une image
          </label>
          <input
            id="import-image"
            type="file"
            accept=".img.mdlc"
            onChange={handleImportImage}
            className="hidden"
          />

          <label htmlFor="import-all-images" className="cursor-pointer bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300 ease-in-out mr-2">
            Importer une liste d&apos;images
          </label>
          <input
            id="import-all-images"
            type="file"
            accept=".img.mdlc"
            onChange={handleImportAllImages}
            className="hidden"
          />

          <button onClick={handleExportAllImages} className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out">
            Exporter Sous forme de liste d&apos;images
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, image, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105 ${selectedImage && selectedImage.id === image.id ? 'ring-4 ring-blue-500' : ''}`}
            >
              <img
                src={image.url}
                alt={image.nom}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => handleImageClick(image)}
              />
              <div className="p-4">
                {editingImageId === image.id ? (
                  <form onSubmit={handleRenameSubmit} className="mb-2">
                    <input
                      type="text"
                      value={newImageName}
                      onChange={(e) => setNewImageName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out">
                      Confirmer
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-800 mb-2">{image.nom}</p>
                    <button
                      onClick={() => handleRenameClick(image.id, image.nom)}
                      className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition duration-300 ease-in-out mb-2"
                    >
                      Renommer
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out mb-2"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => handleExportImage(image)}
                  className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition duration-300 ease-in-out"
                >
                  Exporter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bibliotheque;
