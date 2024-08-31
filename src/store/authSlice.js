import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { openDB } from 'idb';

// Initialisation de la base de données IndexedDB
const dbPromise = openDB('WorkspaceDB', 1, {
  upgrade(db) {
    // Création des object stores pour les espaces de travail et les paramètres
    db.createObjectStore('workspaces', { keyPath: 'id' });
    db.createObjectStore('settings', { keyPath: 'id' });
  },
});

// Thunk asynchrone pour récupérer les espaces de travail et l'ID de l'espace de travail actuel
export const fetchWorkspaces = createAsyncThunk(
  'auth/fetchWorkspaces',
  async () => {
    const db = await dbPromise;
    const workspaces = await db.getAll('workspaces');
    const currentWorkspaceId = (await db.get('settings', 'currentWorkspace'))?.value;
    return { workspaces, currentWorkspaceId };
  }
);

// Thunk asynchrone pour sauvegarder un espace de travail
export const saveWorkspace = createAsyncThunk(
  'auth/saveWorkspace',
  async (workspace) => {
    const db = await dbPromise;
    await db.put('workspaces', workspace);
    return workspace;
  }
);

// Thunk asynchrone pour supprimer un espace de travail de la base de données
export const deleteWorkspaceFromDB = createAsyncThunk(
  'auth/deleteWorkspaceFromDB',
  async (id) => {
    const db = await dbPromise;
    await db.delete('workspaces', id);
    return id;
  }
);

// Thunk asynchrone pour définir l'espace de travail actuel
export const setCurrentWorkspace = createAsyncThunk(
  'auth/setCurrentWorkspace',
  async (workspace) => {
    const db = await dbPromise;
    await db.put('settings', { id: 'currentWorkspace', value: workspace.id });
    return workspace;
  }
);

// Création du slice pour l'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentWorkspace: null,
    workspaces: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion de la récupération réussie des espaces de travail
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload.workspaces;
        state.currentWorkspace = state.workspaces.find(w => w.id === action.payload.currentWorkspaceId) || state.workspaces[0];
        state.status = 'succeeded';
      })
      // Gestion de la sauvegarde réussie d'un espace de travail
      .addCase(saveWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        } else {
          state.workspaces.push(action.payload);
        }
      })
      // Gestion de la suppression réussie d'un espace de travail
      .addCase(deleteWorkspaceFromDB.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
        if (state.currentWorkspace && state.currentWorkspace.id === action.payload) {
          state.currentWorkspace = state.workspaces[0] || null;
        }
      })
      // Gestion de la définition réussie de l'espace de travail actuel
      .addCase(setCurrentWorkspace.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      });
  },
});

export default authSlice.reducer;