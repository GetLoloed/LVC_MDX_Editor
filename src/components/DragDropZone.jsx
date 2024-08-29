import { FaCloudUploadAlt } from 'react-icons/fa';
import { useState, useRef } from 'react';
function DragDropZone({ onDrop, isImporting, acceptedFileTypes, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onDrop(e.dataTransfer.files);
  };

  return (
    <div
      className={`mb-6 border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-900 bg-opacity-10' : 'border-gray-700 hover:border-gray-600'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <FaCloudUploadAlt className="mx-auto text-3xl sm:text-4xl mb-2 text-gray-400" />
      <p className="text-sm sm:text-lg text-gray-300">
        {isImporting ? 'Importation en cours...' : children}
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onDrop(e.target.files)}
        accept={acceptedFileTypes}
        className="hidden"
        multiple
      />
    </div>
  );
}

export default DragDropZone;