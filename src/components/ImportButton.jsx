import React from 'react';
import { FaFileImport } from 'react-icons/fa';

const ImportButton = ({ onImport }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onImport(file.name, content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <label className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white cursor-pointer">
      <FaFileImport className="inline-block mr-2" />
      Importer
      <input
        type="file"
        accept=".md"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};

export default ImportButton;
