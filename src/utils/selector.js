//les images de la bibliothèque
export const selectImages = (state) => state.bibliotheque.images;
export const selectSelectedImage = (state) => state.bibliotheque.selectedImage;

// Nouveaux sélecteurs pour la structure de fichiers
export const selectFileStructure = (state) => state.fileStructure.root;
export const selectSelectedFileId = (state) => state.fileStructure.selectedFileId;

// Sélecteur pour obtenir un fichier spécifique par son ID
export const selectFileById = (state, fileId) => {
  const findFile = (node) => {
    if (node.id === fileId) return node;
    if (node.children) {
      for (let child of node.children) {
        const found = findFile(child);
        if (found) return found;
      }
    }
    return null;
  };
  return findFile(state.fileStructure.root);
};

// Nouveau sélecteur pour les blocs
export const selectBlocs = (state) => state.blocs.blocs;
