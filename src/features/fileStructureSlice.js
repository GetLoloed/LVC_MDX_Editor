import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('fileStructure');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const initialState = loadState() || {
  root: {
    id: 'root',
    name: 'Root',
    type: 'folder',
    children: []
  },
  selectedFileId: null
};

const findItemById = (tree, id) => {
  if (tree.id === id) return tree;
  if (tree.children) {
    for (let child of tree.children) {
      const found = findItemById(child, id);
      if (found) return found;
    }
  }
  return null;
};

const removeItemById = (tree, id) => {
  if (tree.children) {
    tree.children = tree.children.filter(child => child.id !== id);
    tree.children.forEach(child => removeItemById(child, id));
  }
};

const fileStructureSlice = createSlice({
  name: 'fileStructure',
  initialState,
  reducers: {
    createFolder: (state, action) => {
      const { parentId, name } = action.payload;
      const newFolder = {
        id: Date.now().toString(),
        name,
        type: 'folder',
        children: []
      };
      const parent = findItemById(state.root, parentId);
      if (parent && parent.type === 'folder') {
        parent.children.push(newFolder);
      }
    },
    createFile: (state, action) => {
      const { parentId, name } = action.payload;
      const newFile = {
        id: Date.now().toString(),
        name,
        type: 'file',
        content: ''
      };
      const parent = findItemById(state.root, parentId);
      if (parent && parent.type === 'folder') {
        parent.children.push(newFile);
      }
    },
    renameItem: (state, action) => {
      const { id, newName } = action.payload;
      const item = findItemById(state.root, id);
      if (item) {
        item.name = newName;
      }
    },
    deleteItem: (state, action) => {
      removeItemById(state.root, action.payload);
      if (state.selectedFileId === action.payload) {
        state.selectedFileId = null;
      }
    },
    moveItem: (state, action) => {
      const { sourceId, targetId } = action.payload;
      let sourceItem;
      let sourceParent;

      const findItem = (items, parentId = null) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === sourceId) {
            sourceItem = items[i];
            sourceParent = { items, index: i, id: parentId };
            return true;
          }
          if (items[i].children && findItem(items[i].children, items[i].id)) {
            return true;
          }
        }
        return false;
      };

      const addToTarget = (items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === targetId) {
            if (items[i].type === 'folder') {
              if (!items[i].children) items[i].children = [];
              items[i].children.push(sourceItem);
              return true;
            }
          }
          if (items[i].children && addToTarget(items[i].children)) {
            return true;
          }
        }
        return false;
      };

      if (findItem(state.root.children) && addToTarget(state.root.children)) {
        sourceParent.items.splice(sourceParent.index, 1);
      }

      localStorage.setItem('fileStructure', JSON.stringify(state));
    },
    selectFile: (state, action) => {
      state.selectedFileId = action.payload;
    },
    updateFileContent: (state, action) => {
      const { fileId, content } = action.payload;
      const file = findItemById(state.root, fileId);
      if (file && file.type === 'file') {
        file.content = content;
      }
    },
    ajouterFichier: (state, action) => {
      state.root.children.push(action.payload);
      localStorage.setItem('fileStructure', JSON.stringify(state));
    },
    modifierFichier: (state, action) => {
      const { id, content } = action.payload;
      const updateFile = (node) => {
        if (node.id === id) {
          node.content = content;
          return true;
        }
        if (node.children) {
          for (let child of node.children) {
            if (updateFile(child)) return true;
          }
        }
        return false;
      };
      updateFile(state.root);
      localStorage.setItem('fileStructure', JSON.stringify(state));
    },
    reorderItems: (state, action) => {
      const { sourceId, targetId, position } = action.payload;
      const moveItem = (items) => {
        const sourceIndex = items.findIndex(item => item.id === sourceId);
        if (sourceIndex > -1) {
          const [movedItem] = items.splice(sourceIndex, 1);
          const targetIndex = items.findIndex(item => item.id === targetId);
          if (position === 'before') {
            items.splice(targetIndex, 0, movedItem);
          } else {
            items.splice(targetIndex + 1, 0, movedItem);
          }
          return true;
        }
        for (let item of items) {
          if (item.children && moveItem(item.children)) {
            return true;
          }
        }
        return false;
      };
      moveItem(state.root.children);
      localStorage.setItem('fileStructure', JSON.stringify(state));
    },
  }
});

export const { 
  createFolder, 
  createFile, 
  renameItem, 
  deleteItem, 
  moveItem, 
  selectFile,
  updateFileContent,
  ajouterFichier,
  modifierFichier,
  reorderItems
} = fileStructureSlice.actions;

export default fileStructureSlice.reducer;