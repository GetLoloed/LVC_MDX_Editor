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

  const importMarkdown = useCallback((file, callback) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target.result;
      try {
        // Essayez de déchiffrer le contenu
        const decryptedContent = decryptData(content);
        callback(decryptedContent);
      } catch (error) {
        // Si le déchiffrement échoue, supposez que le contenu n'est pas chiffré
        console.log('Le fichier n\'est pas chiffré ou le déchiffrement a échoué. Utilisation du contenu brut.');
        callback(content);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  }, []);

  return { exportMarkdown, importMarkdown, isExporting, isImporting };
}