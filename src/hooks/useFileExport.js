import { useState, useCallback } from 'react';
import { encryptData, decryptData } from '../utils/encryptions';

export function useFileExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportMarkdown = useCallback(async (content, fileName, shouldEncrypt = false) => {
    setIsExporting(true);
    try {
      let dataToExport = shouldEncrypt ? encryptData(content) : content;
      const blob = new Blob([dataToExport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName + '.md'; // Toujours exporter avec l'extension .md
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Fonction pour importer le contenu Markdown
  const importMarkdown = useCallback((file, callback) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target.result;
      try {
        // Essai de déchiffrement du contenu
        const decryptedContent = decryptData(content);
        callback(decryptedContent);
      } catch (error) {
        // Si le déchiffrement échoue, on utilise le contenu brut
        callback(content);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  }, []);

  // Fonction pour exporter une image
  const exportImage = useCallback(async (image) => {
    setIsExporting(true);
    try {
      const blob = new Blob([atob(image.data)], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.nom;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export de l\'image:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Fonction pour exporter plusieurs images
  const exportImages = useCallback(async (images) => {
    setIsExporting(true);
    try {
      for (const image of images) {
        await exportImage(image);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des images:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [exportImage]);

  // Fonction pour exporter un bloc
  const exportBloc = useCallback(async (bloc, shouldEncrypt = false) => {
    setIsExporting(true);
    try {
      let dataToExport = shouldEncrypt ? encryptData(JSON.stringify(bloc)) : JSON.stringify(bloc);
      const blob = new Blob([dataToExport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bloc.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export du bloc:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Fonction pour importer un bloc
  const importBloc = useCallback((file, callback) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target.result;
      try {
        // Essai de déchiffrement du contenu
        const decryptedContent = decryptData(content);
        callback(JSON.parse(decryptedContent));
      } catch (error) {
        // Si le déchiffrement échoue, on utilise le contenu brut
        callback(JSON.parse(content));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  }, []);

  // Fonction pour exporter plusieurs blocs
  const exportBlocs = useCallback(async (blocs, shouldEncrypt = false) => {
    setIsExporting(true);
    try {
      let dataToExport = shouldEncrypt ? encryptData(JSON.stringify(blocs)) : JSON.stringify(blocs);
      const blob = new Blob([dataToExport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocs_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export des blocs:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Fonction pour importer plusieurs blocs
  const importBlocs = useCallback((file, callback) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target.result;
      try {
        // Essai de déchiffrement du contenu
        const decryptedContent = decryptData(content);
        callback(JSON.parse(decryptedContent));
      } catch (error) {
        // Si le déchiffrement échoue, on utilise le contenu brut
        callback(JSON.parse(content));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  }, []);

  return { exportMarkdown, importMarkdown, exportImage, exportImages, exportBloc, importBloc, exportBlocs, importBlocs, isExporting, isImporting };
}