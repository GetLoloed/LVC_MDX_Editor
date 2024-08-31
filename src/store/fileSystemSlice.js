import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { fileSystemDB } from '../utils/db';

// Thunk asynchrone pour récupérer le système de fichiers
export const fetchFileSystem = createAsyncThunk(
  'fileSystem/fetchFileSystem',
  async (workspaceId) => {
    return await fileSystemDB.getAllItems(workspaceId);
  }
);

// Thunk asynchrone pour ajouter un fichier
export const addFile = createAsyncThunk(
  'fileSystem/addFile',
  async (file, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    const fileWithId = { ...file, id: file.id || uuidv4(), workspaceId };
    await fileSystemDB.addFile(fileWithId);
    return { ...fileWithId, type: 'file' };
  }
);

// Thunk asynchrone pour ajouter un dossier
export const addFolder = createAsyncThunk(
  'fileSystem/addFolder',
  async (folder, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    const folderWithId = { ...folder, id: folder.id || uuidv4(), workspaceId };
    await fileSystemDB.addFolder(folderWithId);
    return { ...folderWithId, type: 'folder' };
  }
);

// Thunk asynchrone pour mettre à jour un fichier
export const updateFile = createAsyncThunk(
  'fileSystem/updateFile',
  async (file, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    await fileSystemDB.updateFile({ ...file, workspaceId });
    return file;
  }
);

// Thunk asynchrone pour mettre à jour un dossier
export const updateFolder = createAsyncThunk(
  'fileSystem/updateFolder',
  async (folder, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    await fileSystemDB.updateFolder({ ...folder, workspaceId });
    return folder;
  }
);

// Thunk asynchrone pour supprimer un fichier
export const deleteFile = createAsyncThunk(
  'fileSystem/deleteFile',
  async (id, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    await fileSystemDB.deleteFile(id);
    return id;
  }
);

// Thunk asynchrone pour supprimer un dossier
export const deleteFolder = createAsyncThunk(
  'fileSystem/deleteFolder',
  async (id, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    await fileSystemDB.deleteFolder(id);
    return id;
  }
);

// Thunk asynchrone pour déplacer un élément (fichier ou dossier)
export const moveItem = createAsyncThunk(
  'fileSystem/moveItem',
  async ({ id, type, destinationParentId }, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    const items = type === 'file' ? state.fileSystem.files : state.fileSystem.folders;
    const item = items.find(i => i.id === id);

    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = { ...item, parentId: destinationParentId === 'root' ? 'root' : destinationParentId, workspaceId };
    
    if (type === 'file') {
      await fileSystemDB.updateFile(updatedItem);
    } else {
      await fileSystemDB.updateFolder(updatedItem);
    }

    return { id, type, destinationParentId };
  }
);

// Thunk asynchrone pour récupérer tous les éléments (fichiers et dossiers)
export const fetchAllItems = createAsyncThunk(
  'fileSystem/fetchAllItems',
  async (workspaceId) => {
    return await fileSystemDB.getAllItems(workspaceId);
  }
);

// Création du slice pour le système de fichiers
const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState: {
    files: [],
    folders: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion des états pour fetchFileSystem
      .addCase(fetchFileSystem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFileSystem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files = action.payload.files;
        state.folders = action.payload.folders;
      })
      .addCase(fetchFileSystem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Ajout d'un fichier
      .addCase(addFile.fulfilled, (state, action) => {
        state.files.push(action.payload);
      })
      // Ajout d'un dossier
      .addCase(addFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      })
      // Mise à jour d'un fichier
      .addCase(updateFile.fulfilled, (state, action) => {
        const index = state.files.findIndex(file => file.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })
      // Mise à jour d'un dossier
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.folders.findIndex(folder => folder.id === action.payload.id);
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
      })
      // Suppression d'un fichier
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file.id !== action.payload);
      })
      // Suppression d'un dossier
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(folder => folder.id !== action.payload);
      })
      // Déplacement d'un élément
      .addCase(moveItem.fulfilled, (state, action) => {
        const { id, type, destinationParentId } = action.payload;
        const items = type === 'file' ? state.files : state.folders;
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          items[itemIndex].parentId = destinationParentId;
        }
      })
      // Gestion des états pour fetchAllItems
      .addCase(fetchAllItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files = action.payload.files;
        state.folders = action.payload.folders;
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default fileSystemSlice.reducer;