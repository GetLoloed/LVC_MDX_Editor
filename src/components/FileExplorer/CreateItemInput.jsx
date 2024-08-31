import React, { useState } from 'react';
import PropTypes from 'prop-types';

function CreateItemInput({ type, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting ${type} with name: ${name}`);
    onSubmit(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`Nouveau ${type === 'file' ? 'fichier' : 'dossier'}...`}
        className="bg-obsidian-bg text-obsidian-text border-obsidian-border focus:border-obsidian-accent focus:ring-1 focus:ring-obsidian-accent rounded-md shadow-sm w-full py-1 px-2"
        autoFocus
      />
      <div className="mt-2 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-obsidian-hover text-obsidian-text rounded"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-obsidian-accent text-obsidian-bg rounded"
        >
          Créer {type === 'file' ? 'fichier' : 'dossier'}
        </button>
      </div>
    </form>
  );
}

CreateItemInput.propTypes = {
  type: PropTypes.oneOf(['file', 'folder']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default CreateItemInput;