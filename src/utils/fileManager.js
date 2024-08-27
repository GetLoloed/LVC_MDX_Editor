// Fonction utilitaire pour générer un ID unique
const generateId = () => Math.random().toString(36).substr(2, 9);

// Fonction récursive pour mettre à jour la structure
const updateStructure = (structure, id, updateFn) => {
  if (structure.id === id) {
    return updateFn(structure);
  }
  if (structure.type === 'folder') {
    return {
      ...structure,
      children: structure.children.map(child => updateStructure(child, id, updateFn))
    };
  }
  return structure;
};

export const createFolder = (structure, parentId, folderName) => {
  const newFolder = {
    id: generateId(),
    name: folderName,
    type: 'folder',
    children: []
  };

  return updateStructure(structure, parentId, parent => ({
    ...parent,
    children: [...parent.children, newFolder]
  }));
};

export const renameFolder = (structure, folderId, newName) => {
  return updateStructure(structure, folderId, folder => ({
    ...folder,
    name: newName
  }));
};

export const deleteFolder = (structure, folderId) => {
  const deleteRecursively = (currentStructure) => {
    if (currentStructure.id === folderId) {
      return null;
    }
    if (currentStructure.type === 'folder') {
      return {
        ...currentStructure,
        children: currentStructure.children
          .map(deleteRecursively)
          .filter(child => child !== null)
      };
    }
    return currentStructure;
  };

  return deleteRecursively(structure);
};

export const createFile = (structure, parentId, fileName) => {
  const newFile = {
    id: generateId(),
    name: fileName,
    type: 'file',
    content: ''
  };

  return updateStructure(structure, parentId, parent => ({
    ...parent,
    children: [...parent.children, newFile]
  }));
};

export const renameFile = (structure, fileId, newName) => {
  return updateStructure(structure, fileId, file => ({
    ...file,
    name: newName
  }));
};

export const deleteFile = (structure, fileId) => {
  const deleteRecursively = (currentStructure) => {
    if (currentStructure.id === fileId) {
      return null;
    }
    if (currentStructure.type === 'folder') {
      return {
        ...currentStructure,
        children: currentStructure.children
          .map(deleteRecursively)
          .filter(child => child !== null)
      };
    }
    return currentStructure;
  };

  return deleteRecursively(structure);
};

export const moveItem = (structure, itemId, targetId) => {
  let itemToMove = null
  let newStructure = { ...structure }

  const findAndRemoveItem = (currentItem) => {
    if (!currentItem) return null;
    if (currentItem.id === itemId) {
      itemToMove = { ...currentItem }
      return null
    }
    if (currentItem.type === 'folder') {
      return {
        ...currentItem,
        children: currentItem.children
          .map(findAndRemoveItem)
          .filter(Boolean) // Filtrer les éléments null
      }
    }
    return currentItem
  }

  const insertItem = (currentItem) => {
    if (!currentItem) return null;
    if (currentItem.id === targetId) {
      if (currentItem.type === 'folder' && itemToMove) {
        return {
          ...currentItem,
          children: [...currentItem.children, itemToMove].filter(Boolean)
        }
      }
      return currentItem
    }
    if (currentItem.type === 'folder') {
      return {
        ...currentItem,
        children: currentItem.children.map(insertItem).filter(Boolean)
      }
    }
    return currentItem
  }

  newStructure = findAndRemoveItem(newStructure)

  if (itemToMove) {
    if (targetId === 'root') {
      newStructure = {
        ...newStructure,
        children: [...newStructure.children, itemToMove].filter(Boolean)
      }
    } else {
      newStructure = insertItem(newStructure)
    }
  }

  return newStructure
}

// Pas besoin d'exporter à nouveau ici, car chaque fonction est déjà exportée individuellement