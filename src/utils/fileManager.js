const generateId = () => Math.random().toString(36).slice(2, 11);

export const updateStructure = (structure, id, updateFn) => {
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
  let itemToMove = null;
  let newStructure = { ...structure };

  const findAndRemoveItem = (currentItem) => {
    if (currentItem.id === itemId) {
      itemToMove = { ...currentItem };
      return null;
    }
    if (currentItem.type === 'folder') {
      return {
        ...currentItem,
        children: currentItem.children
          .map(findAndRemoveItem)
          .filter(child => child !== null)
      };
    }
    return currentItem;
  };

  const insertItem = (currentItem) => {
    if (currentItem.id === targetId) {
      if (currentItem.type === 'folder') {
        return {
          ...currentItem,
          children: [...currentItem.children, itemToMove]
        };
      }
      return currentItem;
    }
    if (currentItem.type === 'folder') {
      return {
        ...currentItem,
        children: currentItem.children.map(insertItem)
      };
    }
    return currentItem;
  };

  newStructure = findAndRemoveItem(newStructure);

  if (itemToMove) {
    if (targetId === 'root') {
      newStructure = {
        ...newStructure,
        children: [...newStructure.children, itemToMove]
      };
    } else {
      newStructure = insertItem(newStructure);
    }
  }

  return newStructure;
};

export const updateFileContent = (structure, fileId, newContent) => {
  return updateStructure(structure, fileId, file => ({
    ...file,
    content: newContent
  }));
};