import React from 'react';
import { FaFileExport } from 'react-icons/fa';

const ExportButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
    >
      <FaFileExport className="inline-block mr-2" />
      Exporter
    </button>
  );
};

export default ExportButton;