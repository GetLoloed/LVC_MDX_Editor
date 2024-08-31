import React, { forwardRef } from 'react';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

const ContextMenu = forwardRef(({ contextMenu, onRename, onDelete }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute bg-obsidian-bg border border-obsidian-border rounded shadow-lg py-2"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
        transform: 'translateY(-100%)'
      }}
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-obsidian-hover"
        onClick={onRename}
      >
        <AiOutlineEdit className="inline mr-2" />
        Renommer
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-obsidian-hover text-red-500"
        onClick={onDelete}
      >
        <AiOutlineDelete className="inline mr-2" />
        Supprimer
      </button>
    </div>
  );
});

export default ContextMenu;