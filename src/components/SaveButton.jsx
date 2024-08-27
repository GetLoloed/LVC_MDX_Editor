import React from 'react';
import { FaSave } from 'react-icons/fa';

const SaveButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded mr-2 ${disabled
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
    >
      <FaSave className="inline-block mr-2" />
      Sauvegarder
    </button>
  );
};

export default SaveButton;