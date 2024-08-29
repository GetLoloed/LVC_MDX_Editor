import { useState } from 'react';
import { useFileExport } from './useFileExport';

export function useFileOperations() {
  const { exportMarkdown, importBloc, isExporting, isImporting } = useFileExport();
  const [isEncrypted, setIsEncrypted] = useState(false);

  const handleExport = async (content, fileName) => {
    if (!fileName) {
      alert("Veuillez sélectionner un fichier avant d'exporter.");
      return;
    }

    try {
      console.log('Début de l\'export. Fichier:', fileName, 'Chiffré:', isEncrypted);
      console.log('Contenu à exporter:', content);
      await exportMarkdown(content, fileName, isEncrypted);
      console.log('Export réussi');
      alert('Export réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export : ' + error.message);
    }
  };

  const handleImport = (file, onImportSuccess) => {
    if (file) {
      console.log('Début de l\'import. Fichier:', file.name);
      importBloc(file, (importedContent) => {
        console.log('Import réussi. Type de contenu importé:', typeof importedContent);
        if (typeof importedContent === 'object') {
          importedContent = JSON.stringify(importedContent);
        }
        console.log('Contenu importé:', importedContent.substring(0, 50) + '...');
        onImportSuccess(importedContent, file.name);
        alert('Import réussi !');
        setIsEncrypted(false);
      });
    }
  };

  const toggleEncryption = () => {
    if (confirm(`Êtes-vous sûr de vouloir ${isEncrypted ? 'désactiver' : 'activer'} le chiffrement ?`)) {
      setIsEncrypted(!isEncrypted);
    }
  };

  return { 
    handleExport, 
    handleImport, 
    isExporting, 
    isImporting, 
    isEncrypted, 
    toggleEncryption 
  };
}