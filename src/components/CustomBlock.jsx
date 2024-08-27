import React, { useState } from 'react';
import MarkdownPreview from './MarkdownPreview';

const CustomBlock = ({ block, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);

  const handleSave = () => {
    onSave({ ...block, content });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border p-2 my-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-2 border rounded"
        />
        <div className="mt-2">
          <button onClick={handleSave} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Sauvegarder</button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-2 py-1 rounded">Annuler</button>
        </div>
      </div>
    );
  }

  return (
    <div className="border p-2 my-2">
      <MarkdownPreview content={content} />
      <div className="mt-2">
        <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Modifier</button>
        <button onClick={() => onDelete(block.id)} className="bg-red-500 text-white px-2 py-1 rounded">Supprimer</button>
      </div>
    </div>
  );
};

export default CustomBlock;