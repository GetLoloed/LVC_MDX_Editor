import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ajouterImage, deplacerImage, selectionnerImage, deselectionnerImage, supprimerImage, renommerImage } from '../../features/bibliotheque';
import { selectImages, selectSelectedImage } from '../../utils/selector';

const Bibliotheque = () => {
  // Le dispatch pour envoyer des actions au store Redux
  const dispatch = useDispatch();
  // Les images récupérées du state Redux
  const images = useSelector(selectImages);
  // L'image actuellement sélectionnée
  const selectedImage = useSelector(selectSelectedImage);
  // L'image en cours de glisser-déposer
  const [draggedImage, setDraggedImage] = useState(null);
  // L'ID de l'image en cours d'édition (pour le renommage)
  const [editingImageId, setEditingImageId] = useState(null);
  // Le nouveau nom de l'image en cours d'édition
  const [newImageName, setNewImageName] = useState('');

  // on effectue un useEffect pour recuperer les images de la bibliotheque
  useEffect(() => {
    const storedImages = localStorage.getItem('bibliothequeImages');
    if (storedImages) {
      const parsedImages = JSON.parse(storedImages);
      parsedImages.forEach(image => dispatch(ajouterImage(image)));
    }
  }, [dispatch]);

  // on effectue un useEffect pour sauvegarder les images de la bibliotheque
  useEffect(() => {
    localStorage.setItem('bibliothequeImages', JSON.stringify(images));
  }, [images]);

  // pour gerer le debut glisser-déposer
  const handleDragStart = (e, image, index) => {
    setDraggedImage({ image, index });
  };

  // pour gerer la fin du  glisser-déposer
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // pour gerer le glisser-déposer
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedImage) {
      dispatch(deplacerImage({ sourceIndex: draggedImage.index, targetIndex }));
      setDraggedImage(null);
    }
  };

  // pour gerer le changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // on cree un lecteur de fichier
      const reader = new FileReader();
      // on lit le fichier
      reader.onload = (event) => {
        const base64Image = event.target.result;
        // on ajoute l'image au store
        dispatch(ajouterImage({ base64: base64Image, nom: file.name, id: Date.now() }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (image) => {
    // si l'image est deja selectionnée, on la deselectionne
    if (selectedImage && selectedImage.id === image.id) {
      dispatch(deselectionnerImage());
    } else {
      // on selectionne l'image
      dispatch(selectionnerImage(image));
    }
  };

  const handleDeleteImage = (imageId) => {
    // on supprime l'image
    dispatch(supprimerImage(imageId));
  };

  const handleRenameClick = (imageId, currentName) => {
    // on set l'image en cours d'edition
    setEditingImageId(imageId);
    // on set le nouveau nom de l'image
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bibliothèque d&apos;images</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, image, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`border border-gray-300 p-2 rounded cursor-move ${selectedImage && selectedImage.id === image.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img
              src={image.url}
              alt={image.nom}
              className="w-full h-40 object-cover"
              onClick={() => handleImageClick(image)}
            />
            {editingImageId === image.id ? (
              <form onSubmit={handleRenameSubmit} className="mt-2">
                <input
                  type="text"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                />
                <button type="submit" className="mt-1 w-full bg-blue-500 text-white p-1 rounded hover:bg-blue-600">
                  Confirmer
                </button>
              </form>
            ) : (
              <>
                <p className="mt-2 text-center">{image.nom}</p>
                <button
                  onClick={() => handleRenameClick(image.id, image.nom)}
                  className="mt-1 w-full bg-green-500 text-white p-1 rounded hover:bg-green-600"
                >
                  Renommer
                </button>
              </>
            )}
            <button
              onClick={() => handleDeleteImage(image.id)}
              className="mt-1 w-full bg-red-500 text-white p-1 rounded hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bibliotheque;
