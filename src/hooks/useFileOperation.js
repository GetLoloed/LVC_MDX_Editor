import { useState } from 'react';
import { useFileExport } from './useFileExport';

export function useFileOperations() {
  // Importation des fonctions nécessaires depuis useFileExport
  const { exportMarkdown, importBloc, isExporting, isImporting } = useFileExport();
  // État pour gérer le chiffrement
  const [isEncrypted, setIsEncrypted] = useState(false);

  // Fonction pour gérer l'exportation de fichiers
  const handleExport = async (content, fileName) => {
    if (!fileName) {
      alert("Veuillez sélectionner un fichier avant d'exporter.");
      return;
    }

    try {
      console.log('Début de l\'export. Fichier:', fileName, 'Chiffré:', isEncrypted);
      console.log('Contenu à exporter:', content);
      // Appel de la fonction d'exportation avec le contenu, le nom du fichier et l'état de chiffrement
      await exportMarkdown(content, fileName, isEncrypted);
      console.log('Export réussi');
      alert('Export réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export : ' + error.message);
    }
  };

  // Fonction pour gérer l'importation de fichiers
  const handleImport = (file, onImportSuccess) => {
    if (file) {
      console.log('Début de l\'import. Fichier:', file.name);
      // Utilisation de la fonction importBloc pour traiter le fichier importé
      importBloc(file, (importedContent) => {
        console.log('Import réussi. Type de contenu importé:', typeof importedContent);
        // Conversion du contenu en chaîne JSON si c'est un objet
        if (typeof importedContent === 'object') {
          importedContent = JSON.stringify(importedContent);
        }
        console.log('Contenu importé:', importedContent.substring(0, 50) + '...');
        // Appel de la fonction de callback avec le contenu importé
        onImportSuccess(importedContent, file.name);
        alert('Import réussi !');
        // Réinitialisation de l'état de chiffrement après l'import
        setIsEncrypted(false);
      });
    }
  };

  // Fonction pour basculer l'état de chiffrement
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