import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fileSystemDB } from '../utils/db';

// Thunk asynchrone pour récupérer les blocs d'un espace de travail
export const fetchBlocks = createAsyncThunk(
  'blocks/fetchBlocks',
  async (workspaceId) => {
    return await fileSystemDB.getBlocks(workspaceId);
  }
);

// Thunk asynchrone pour ajouter un nouveau bloc
export const addBlock = createAsyncThunk(
  'blocks/addBlock',
  async (block, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    const blockWithId = { ...block, id: Date.now().toString(), workspaceId };
    await fileSystemDB.addBlock(blockWithId);
    return blockWithId;
  }
);

// Thunk asynchrone pour supprimer un bloc
export const deleteBlock = createAsyncThunk(
  'blocks/deleteBlock',
  async (id) => {
    await fileSystemDB.deleteBlock(id);
    return id;
  }
);

// Thunk asynchrone pour mettre à jour un bloc
export const updateBlock = createAsyncThunk(
  'blocks/updateBlock',
  async (block) => {
    await fileSystemDB.updateBlock(block);
    return block;
  }
);

// Création du slice pour la gestion des blocs
const blockSlice = createSlice({
  name: 'blocks',
  initialState: {
    blocks: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion de l'état pendant la récupération des blocs
      .addCase(fetchBlocks.pending, (state) => {
        state.status = 'loading';
      })
      // Gestion de la récupération réussie des blocs
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.blocks = action.payload;
      })
      // Gestion de l'échec de la récupération des blocs
      .addCase(fetchBlocks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Ajout d'un nouveau bloc dans l'état
      .addCase(addBlock.fulfilled, (state, action) => {
        state.blocks.push(action.payload);
      })
      // Suppression d'un bloc de l'état
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.blocks = state.blocks.filter(block => block.id !== action.payload);
      })
      // Mise à jour d'un bloc dans l'état
      .addCase(updateBlock.fulfilled, (state, action) => {
        const index = state.blocks.findIndex(block => block.id === action.payload.id);
        if (index !== -1) {
          state.blocks[index] = action.payload;
        }
      });
  },
});

export default blockSlice.reducer;