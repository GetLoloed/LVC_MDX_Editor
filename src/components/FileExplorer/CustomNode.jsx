import React, { useState } from 'react';
import { AiOutlineFile, AiOutlineFolder, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

function CustomNode({ node, depth, isOpen, onToggle, onDelete, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.text);

  const handleRename = () => {
    onRename(node.id, node.data.type, newName);
    setIsEditing(false);
  };

  return (
    <div style={{ marginLeft: depth * 20 }} className="flex items-center py-1">
      {node.droppable && (
        <span onClick={onToggle} className="cursor-pointer mr-1">
          {isOpen ? '▼' : '►'}
        </span>
      )}
      {node.data.type === 'folder' ? (
        <AiOutlineFolder className="text-obsidian-accent mr-1" />
      ) : (
        <AiOutlineFile className="text-obsidian-text mr-1" />
      )}
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          className="bg-obsidian-bg text-obsidian-text border-obsidian-border focus:border-obsidian-accent focus:ring-1 focus:ring-obsidian-accent rounded-md shadow-sm py-0 px-1"
          autoFocus
        />
      ) : (
        <span className="flex-grow">{node.text}</span>
      )}
      <button onClick={() => setIsEditing(true)} className="text-obsidian-text hover:text-obsidian-accent ml-2">
        <AiOutlineEdit />
      </button>
      <button onClick={() => onDelete(node.id, node.data.type)} className="text-obsidian-text hover:text-red-500 ml-2">
        <AiOutlineDelete />
      </button>
    </div>
  );
}

export default CustomNode;