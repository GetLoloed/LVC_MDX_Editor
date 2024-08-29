import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaSave, FaTimes } from 'react-icons/fa';
import MarkdownEditor from './MarkDownEditor';

function BlocEditor({ bloc, onSave, onClose }) {
  const [name, setName] = useState(bloc.name);
  const [content, setContent] = useState(bloc.content);
  const [isModified, setIsModified] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setIsModified(true);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    setIsModified(true);
  };

  const handleSave = () => {
    onSave({ ...bloc, name, content });
    setIsModified(false);
  };

  const handleClose = () => {
    if (isModified && !window.confirm('Des modifications non sauvegardées seront perdues. Voulez-vous vraiment fermer ?')) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center">
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:w-auto mb-2 sm:mb-0"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
              disabled={!isModified}
            >
              <FaSave className="mr-2" /> Sauvegarder
            </button>
            <button
              onClick={handleClose}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
            >
              <FaTimes className="mr-2" /> Fermer
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          <MarkdownEditor
            className="h-full"
            initialContent={content}
            onContentChange={handleContentChange}
            isEditingBloc={true}
          />
        </div>
      </div>
    </div>
  );
}

BlocEditor.propTypes = {
  bloc: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BlocEditor;