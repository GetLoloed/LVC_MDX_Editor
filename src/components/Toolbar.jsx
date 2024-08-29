import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaCode, FaQuoteLeft, FaUndo, FaRedo, FaCubes, FaImages, FaDownload, FaUpload, FaLock, FaUnlock } from 'react-icons/fa';
import { useFileExport } from '../hooks/useFileExport';

function Toolbar({ onAction, content }) {
  const { exportMarkdown, importBloc, isExporting, isImporting } = useFileExport();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const selectedFile = useSelector(state => state.fileExplorer.selectedFile);

  const handleExport = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier avant d'exporter.");
      return;
    }

    const fileName = selectedFile.split('/').pop();
    try {
      console.log('Début de l\'export. Fichier:', fileName, 'Chiffré:', isEncrypted);
      console.log('Contenu à exporter:', content); // Assurez-vous que 'content' est défini et contient les données à exporter
      await exportMarkdown(content, fileName, isEncrypted);
      console.log('Export réussi');
      alert('Export réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export : ' + error.message);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Début de l\'import. Fichier:', file.name);
      importBloc(file, (importedContent) => {
        console.log('Import réussi. Type de contenu importé:', typeof importedContent);
        if (typeof importedContent === 'object') {
          // Le contenu était chiffré et a été déchiffré
          importedContent = JSON.stringify(importedContent);
        }
        console.log('Contenu importé:', importedContent.substring(0, 50) + '...');
        onAction('import', { content: importedContent, fileName: file.name });
        alert('Import réussi !');
        // Réinitialiser l'état de chiffrement après l'import
        setIsEncrypted(false);
      });
    }
  };

  const toolbarItems = [
    { icon: FaBold, action: () => onAction('bold'), tooltip: 'Gras (Ctrl+B)' },
    { icon: FaItalic, action: () => onAction('italic'), tooltip: 'Italique (Ctrl+I)' },
    { icon: FaListUl, action: () => onAction('unorderedList'), tooltip: 'Liste à puces' },
    { icon: FaListOl, action: () => onAction('orderedList'), tooltip: 'Liste numérotée' },
    { icon: FaLink, action: () => onAction('link'), tooltip: 'Lien (Ctrl+K)' },
    { icon: FaImage, action: () => onAction('image'), tooltip: 'Image' },
    { icon: FaCode, action: () => onAction('code'), tooltip: 'Code inline (Ctrl+`)' },
    { icon: FaQuoteLeft, action: () => onAction('quote'), tooltip: 'Citation' },
    { icon: FaUndo, action: () => onAction('undo'), tooltip: 'Annuler (Ctrl+Z)' },
    { icon: FaRedo, action: () => onAction('redo'), tooltip: 'Rétablir (Ctrl+Y)' },
    { icon: FaCubes, action: () => onAction('insertBloc'), tooltip: 'Insérer un bloc personnalisé' },
    { icon: FaImages, action: () => onAction('showImages'), tooltip: 'Insérer une image' },
    {
      icon: FaDownload,
      action: handleExport,
      tooltip: 'Exporter le fichier Markdown',
      get disabled() {
        const isDisabled = isExporting || !selectedFile;
        console.log('Export button disabled condition:', {
          isExporting,
          selectedFile,
          isDisabled,
          selectedFileType: typeof selectedFile
        });
        return isDisabled;
      }
    },
    { icon: FaUpload, action: () => document.getElementById('file-import').click(), tooltip: 'Importer un fichier', disabled: isImporting },
    {
      icon: isEncrypted ? FaLock : FaUnlock,
      action: () => {
        if (confirm(`Êtes-vous sûr de vouloir ${isEncrypted ? 'désactiver' : 'activer'} le chiffrement ?`)) {
          setIsEncrypted(!isEncrypted);
        }
      },
      tooltip: isEncrypted ? 'Désactiver le chiffrement' : 'Activer le chiffrement'
    },
  ];

  return (
    <div className="bg-gray-800 text-gray-300 px-4 py-2 flex flex-wrap justify-start items-center">
      {toolbarItems.map((item, index) => {
        const isDisabled = typeof item.disabled === 'function' ? item.disabled() : item.disabled;
        return (
          <button
            key={index}
            onClick={item.action}
            className={`p-1 m-1 hover:bg-gray-700 rounded transition duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={item.tooltip}
            disabled={isDisabled}
            aria-label={item.tooltip}
          >
            <item.icon className={(isExporting && item.icon === FaDownload) || (isImporting && item.icon === FaUpload) ? 'animate-spin' : ''} />
          </button>
        );
      })}
      <input
        id="file-import"
        type="file"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default Toolbar;