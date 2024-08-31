import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fileSystemDB } from '../utils/db';

// Fonction asynchrone pour récupérer les images d'un espace de travail
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async (workspaceId) => {
    return await fileSystemDB.getImages(workspaceId);
  }
);

// Fonction asynchrone pour ajouter une nouvelle image
export const addImage = createAsyncThunk(
  'images/addImage',
  async (image, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    let imageToAdd = {
      id: Date.now().toString(),
      name: image.name,
      data: image.data,
      type: image.type,
      workspaceId
    };
    await fileSystemDB.addImage(imageToAdd);
    return imageToAdd;
  }
);

// Fonction asynchrone pour supprimer une image
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (id) => {
    await fileSystemDB.deleteImage(id);
    return id;
  }
);

// Fonction asynchrone pour mettre à jour une image
export const updateImage = createAsyncThunk(
  'images/updateImage',
  async (image, { getState }) => {
    const state = getState();
    const workspaceId = state.auth.currentWorkspace?.id;
    const updatedImage = { ...image, workspaceId };
    await fileSystemDB.updateImage(updatedImage);
    return updatedImage;
  }
);

// Création du slice pour la gestion des images
const imageSlice = createSlice({
  name: 'images',
  initialState: {
    images: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion de l'état pendant la récupération des images
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
      })
      // Gestion de la récupération réussie des images
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.images = action.payload;
      })
      // Gestion de l'échec de la récupération des images
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Ajout d'une nouvelle image dans l'état
      .addCase(addImage.fulfilled, (state, action) => {
        state.images.push(action.payload);
      })
      // Suppression d'une image de l'état
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.images = state.images.filter(image => image.id !== action.payload);
      })
      // Mise à jour d'une image dans l'état
      .addCase(updateImage.fulfilled, (state, action) => {
        const index = state.images.findIndex(image => image.id === action.payload.id);
        if (index !== -1) {
          state.images[index] = action.payload;
        }
      });
  },
});

export default imageSlice.reducer;