import { openDB } from 'idb';

// Initialisation de la base de données IndexedDB
const dbPromise = openDB('MDX', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Création des object stores si ils n'existent pas déjà
    if (!db.objectStoreNames.contains('files')) {
      const filesStore = db.createObjectStore('files', { keyPath: 'id' });
      filesStore.createIndex('workspaceId', 'workspaceId');
      filesStore.createIndex('parentId', 'parentId');
    }
    if (!db.objectStoreNames.contains('folders')) {
      const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
      foldersStore.createIndex('workspaceId', 'workspaceId');
      foldersStore.createIndex('parentId', 'parentId');
    }
    if (!db.objectStoreNames.contains('workspaces')) {
      db.createObjectStore('workspaces', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('images')) {
      const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
      imagesStore.createIndex('workspaceId', 'workspaceId');
    }
    if (!db.objectStoreNames.contains('blocks')) {
      const blocksStore = db.createObjectStore('blocks', { keyPath: 'id' });
      blocksStore.createIndex('workspaceId', 'workspaceId');
    }
  },
});

// Objet contenant toutes les opérations de la base de données
export const fileSystemDB = {
  // Opérations sur les fichiers
  async getFiles(workspaceId) {
    return (await dbPromise).getAllFromIndex('files', 'workspaceId', workspaceId);
  },
  async addFile(file) {
    return (await dbPromise).add('files', { ...file, type: 'file' });
  },
  async updateFile(file) {
    return (await dbPromise).put('files', file);
  },
  async deleteFile(id) {
    return (await dbPromise).delete('files', id);
  },

  // Opérations sur les dossiers
  async getFolders(workspaceId) {
    return (await dbPromise).getAllFromIndex('folders', 'workspaceId', workspaceId);
  },
  async addFolder(folder) {
    return (await dbPromise).add('folders', { ...folder, type: 'folder' });
  },
  async updateFolder(folder) {
    return (await dbPromise).put('folders', folder);
  },
  async deleteFolder(id) {
    return (await dbPromise).delete('folders', id);
  },

  // Opération de déplacement d'un élément (fichier ou dossier)
  async moveItem(item) {
    const store = item.type === 'file' ? 'files' : 'folders';
    return (await dbPromise).put(store, item);
  },

  // Récupération de tous les éléments d'un espace de travail
  async getAllItems(workspaceId) {
    const db = await dbPromise;
    const files = await db.getAllFromIndex('files', 'workspaceId', workspaceId);
    const folders = await db.getAllFromIndex('folders', 'workspaceId', workspaceId);
    return { files, folders };
  },

  // Opérations sur les espaces de travail
  async getWorkspaces() {
    return (await dbPromise).getAll('workspaces');
  },
  async addWorkspace(workspace) {
    return (await dbPromise).add('workspaces', workspace);
  },
  async updateWorkspace(workspace) {
    return (await dbPromise).put('workspaces', workspace);
  },
  async deleteWorkspace(id) {
    return (await dbPromise).delete('workspaces', id);
  },

  // Opérations sur l'espace de travail actuel
  async getCurrentWorkspace() {
    return (await dbPromise).get('settings', 'currentWorkspace');
  },
  async setCurrentWorkspace(workspaceId) {
    return (await dbPromise).put('settings', { id: 'currentWorkspace', value: workspaceId });
  },

  // Opérations sur les images
  async getImages(workspaceId) {
    return (await dbPromise).getAllFromIndex('images', 'workspaceId', workspaceId);
  },
  async addImage(image) {
    return (await dbPromise).add('images', image);
  },
  async updateImage(image) {
    return (await dbPromise).put('images', image);
  },
  async deleteImage(id) {
    return (await dbPromise).delete('images', id);
  },

  // Opérations sur les blocs
  async getBlocks(workspaceId) {
    return (await dbPromise).getAllFromIndex('blocks', 'workspaceId', workspaceId);
  },
  async addBlock(block) {
    return (await dbPromise).add('blocks', block);
  },
  async updateBlock(block) {
    return (await dbPromise).put('blocks', block);
  },
  async deleteBlock(id) {
    return (await dbPromise).delete('blocks', id);
  },
};