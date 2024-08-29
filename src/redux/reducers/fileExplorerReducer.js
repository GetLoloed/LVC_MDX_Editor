import {
  CREATE_FOLDER,
  CREATE_FILE,
  RENAME_ITEM,
  DELETE_ITEM,
  MOVE_ITEM,
  SELECT_FILE,
  UPDATE_FILE_CONTENT,
  SEARCH_FILES,
  SORT_FILES,
  FILTER_FILES,
  IMPORT_FILE,
  CHECK_FILE_EXISTS,
  SET_SELECTED_FILE
} from '../actions/fileExplorerActions';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('fileExplorerState');
    if (serializedState === null) {
      return { files: [] };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return { files: [] };
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('fileExplorerState', serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

const initialState = {
  files: [],
  selectedFile: null,
  selectedFileContent: '',
  selectedFolder: null,
  undoStack: [],
  redoStack: [],
  searchTerm: '',
  sortCriteria: 'name',
  filterType: 'all',
  filteredFiles: []
};

const findItemByPath = (items, path) => {
  const parts = path.split('/').filter(Boolean);
  let current = items;
  for (const part of parts) {
    const found = current.find(item => item.name === part);
    if (!found) return null;
    current = found.children || found;
  }
  return current;
};

const removeItemByPath = (items, path) => {
  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length === 1) {
    return items.filter(item => item.name !== pathParts[0]);
  }
  return items.map(item => {
    if (item.type === 'folder' && item.name === pathParts[0]) {
      return {
        ...item,
        children: removeItemByPath(item.children, pathParts.slice(1).join('/'))
      };
    }
    return item;
  });
};

const renameItemByPath = (items, path, newName) => {
  const pathParts = path.split('/').filter(Boolean);
  return items.map(item => {
    if (item.name === pathParts[0]) {
      if (pathParts.length === 1) {
        return { ...item, name: newName };
      } else if (item.type === 'folder') {
        return {
          ...item,
          children: renameItemByPath(item.children, pathParts.slice(1).join('/'), newName)
        };
      }
    }
    return item;
  });
};

const addItemToPath = (items, path, newItem) => {
  if (path === '') {
    return [...items, newItem];
  }

  return items.map(item => {
    if (item.type === 'folder') {
      const pathParts = path.split('/').filter(Boolean);
      if (item.name === pathParts[0]) {
        if (pathParts.length === 1) {
          return {
            ...item,
            children: [...item.children, newItem]
          };
        } else {
          return {
            ...item,
            children: addItemToPath(item.children, pathParts.slice(1).join('/'), newItem)
          };
        }
      }
    }
    return item;
  });
};

const moveItemInTree = (items, sourcePath, targetPath) => {
  console.log('moveItemInTree called with:', { items, sourcePath, targetPath });
  const sourcePathParts = sourcePath.split('/').filter(Boolean);
  const targetPathParts = targetPath.split('/').filter(Boolean);

  // Fonction pour trouver et retirer l'élément source
  const removeSourceItem = (currentItems, pathParts) => {
    if (pathParts.length === 1) {
      const removedItem = currentItems.find(item => item.name === pathParts[0]);
      return [currentItems.filter(item => item.name !== pathParts[0]), removedItem];
    }
    const [currentPart, ...restParts] = pathParts;
    const index = currentItems.findIndex(item => item.name === currentPart);
    if (index !== -1) {
      const [updatedChildren, removedItem] = removeSourceItem([...currentItems[index].children], restParts);
      const updatedItem = { ...currentItems[index], children: updatedChildren };
      return [[...currentItems.slice(0, index), updatedItem, ...currentItems.slice(index + 1)], removedItem];
    }
    return [currentItems, null];
  };

  // Fonction pour ajouter l'élément à la cible
  const addItemToTarget = (currentItems, pathParts, itemToAdd) => {
    if (pathParts.length === 1) {
      return [...currentItems, itemToAdd];
    }
    const [currentPart, ...restParts] = pathParts;
    const index = currentItems.findIndex(item => item.name === currentPart);
    if (index !== -1) {
      const updatedChildren = restParts.length === 0
        ? [...currentItems[index].children, itemToAdd]
        : addItemToTarget(currentItems[index].children || [], restParts, itemToAdd);
      const updatedItem = {
        ...currentItems[index],
        children: updatedChildren
      };
      return [...currentItems.slice(0, index), updatedItem, ...currentItems.slice(index + 1)];
    }
    console.error('Target folder does not exist:', currentPart);
    return currentItems;
  };

  // Retirer l'élément source
  const [updatedItems, removedItem] = removeSourceItem([...items], sourcePathParts);

  // Si l'élément n'a pas été trouvé, retourner les items inchangés
  if (!removedItem) return items;

  // Ajouter l'élément à la cible
  const result = addItemToTarget(updatedItems, targetPathParts, removedItem);
  console.log('moveItemInTree result:', result);
  return result;
};

const updateFileContentInTree = (files, path, content) => {
  const pathParts = path.split('/').filter(Boolean);
  return files.map(file => {
    if (file.name === pathParts[0]) {
      if (pathParts.length === 1 && file.type === 'file') {
        return { ...file, content };
      } else if (file.type === 'folder') {
        return { ...file, children: updateFileContentInTree(file.children, pathParts.slice(1).join('/'), content) };
      }
    }
    return file;
  });
};

const removeDuplicates = (items) => {
  if (!items || !Array.isArray(items)) {
    console.error('Items is not an array:', items);
    return [];
  }

  const seen = new Set();
  return items.filter(item => {
    const duplicate = seen.has(item.name);
    seen.add(item.name);
    return !duplicate;
  }).map(item => {
    if (item.type === 'folder' && item.children) {
      return { ...item, children: removeDuplicates(item.children) };
    }
    return item;
  });
};

const searchInFiles = (files, term) => {
  return files.filter(item => {
    if (item.name.toLowerCase().includes(term.toLowerCase())) {
      return true;
    }
    if (item.type === 'folder' && item.children) {
      item.children = searchInFiles(item.children, term);
      return item.children.length > 0;
    }
    return false;
  });
};

const sortFileItems = (items, criteria) => {
  return [...items].sort((a, b) => {
    if (criteria === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (criteria === 'type') {
      return a.type.localeCompare(b.type);
    }
    if (criteria === 'date') {
      return new Date(b.modifiedDate) - new Date(a.modifiedDate);
    }
    return 0;
  });
};

const filterFileItems = (items, type) => {
  if (type === 'all') return items;
  return items.filter(item => {
    if (item.type === type) return true;
    if (item.type === 'folder' && item.children) {
      item.children = filterFileItems(item.children, type);
      return item.children.length > 0;
    }
    return false;
  });
};

const fileExplorerReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case CREATE_FOLDER:
      newState = {
        ...state,
        files: addItemToPath(state.files, action.payload.path, { name: action.payload.name, type: 'folder', children: [] })
      };
      break;
    case CREATE_FILE:
      newState = {
        ...state,
        files: addItemToPath(state.files, action.payload.path, { name: action.payload.name, type: 'file', content: action.payload.content })
      };
      break;
    case RENAME_ITEM:
      newState = {
        ...state,
        files: renameItemByPath(state.files, action.payload.path, action.payload.newName)
      };
      break;
    case DELETE_ITEM:
      newState = {
        ...state,
        files: removeItemByPath(state.files, action.payload.path)
      };
      break;
    case MOVE_ITEM:
      console.log('Moving item:', action.payload);
      newState = {
        ...state,
        files: moveItemInTree(state.files, action.payload.sourcePath, action.payload.targetPath)
      };
      console.log('New state after move:', newState);
      console.log('Files structure after move:', JSON.stringify(newState.files, null, 2));
      break;
    case SELECT_FILE:
      newState = {
        ...state,
        selectedFile: action.payload.path,
        selectedFileContent: action.payload.content
      };
      break;
    case UPDATE_FILE_CONTENT:
      newState = {
        ...state,
        files: updateFileContentInTree(state.files, action.payload.path, action.payload.content),
        selectedFileContent: action.payload.content
      };
      break;
    case 'UPDATE_UNDO_STACK':
      newState = {
        ...state,
        undoStack: [...(state.undoStack || []), action.payload]
      };
      break;
    case 'UPDATE_REDO_STACK':
      newState = {
        ...state,
        redoStack: action.payload
      };
      break;
    case SEARCH_FILES:
      newState = {
        ...state,
        searchTerm: action.payload,
        filteredFiles: searchInFiles([...state.files], action.payload)
      };
      break;
    case SORT_FILES:
      newState = {
        ...state,
        sortCriteria: action.payload,
        filteredFiles: sortFileItems(state.filteredFiles.length > 0 ? state.filteredFiles : state.files, action.payload)
      };
      break;
    case FILTER_FILES:
      newState = {
        ...state,
        filterType: action.payload,
        filteredFiles: filterFileItems(state.files, action.payload)
      };
      break;
    case IMPORT_FILE:
      const { fileName, content } = action.payload;
      newState = {
        ...state,
        files: addItemToPath(state.files, '', { name: fileName, type: 'file', content }),
        selectedFile: fileName,
        selectedFileContent: content
      };
      break;
    case CHECK_FILE_EXISTS:
      const fileExists = findItemByPath(state.files, action.payload.path) !== null;
      return {
        ...state,
        selectedFile: fileExists ? state.selectedFile : null,
        selectedFileContent: fileExists ? state.selectedFileContent : ''
      };
    case SET_SELECTED_FILE:
      return {
        ...state,
        selectedFile: action.payload
      };
    default:
      newState = state;
  }
  saveState(newState);
  return newState;
};

export default fileExplorerReducer;