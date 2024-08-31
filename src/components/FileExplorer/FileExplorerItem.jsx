import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { AiOutlineFile, AiOutlineFolder } from 'react-icons/ai';

function FileExplorerItem({ item, isEditing, isOpen, onRename, onContextMenu, setEditingId, onMove, onToggle, onFileClick, children }) {
  // Gestion du drag et drop interne
  const [{ isDragging }, drag] = useDrag({
    type: 'INTERNAL_ITEM',
    item: () => ({ id: item.id, type: item.type, parentId: item.parentId }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Gestion du drop interne
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'INTERNAL_ITEM',
    drop: (draggedItem) => {
      if (draggedItem.id !== item.id) {
        onMove(draggedItem, item);
      }
    },
    canDrop: (draggedItem) => {
      if (draggedItem.id === item.id) return false;
      if (item.type === 'folder') return true;
      return false; // Ne permet pas le drop sur les fichiers
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine les refs pour le drag et le drop
  const dragDropRef = (el) => {
    drag(el);
    drop(el);
  };

  const opacity = isDragging ? 0.5 : 1;
  let backgroundColor = '';
  if (isOver && canDrop) {
    backgroundColor = 'bg-obsidian-accent bg-opacity-20';
  } else if (canDrop) {
    backgroundColor = 'bg-obsidian-hover';
  }

  // Gestion du clic sur un élément de type fichier ou dossier
  const handleClick = () => {
    if (item.type === 'folder') {
      onToggle();
    } else {
      onFileClick(item);
    }
  };

  // Gestion de la touche Entrée pour renommer un élément
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onRename(e.target.value);
    }
  };

  return (
    <li
      ref={dragDropRef}
      style={{ opacity }}
      className={`mb-1 ${backgroundColor} transition-colors duration-200`}
    >
      <div
        className={`flex items-center space-x-1 py-1 px-2 rounded cursor-pointer
                    ${isOver && canDrop ? 'border-2 border-obsidian-accent' : ''}
                    ${canDrop ? 'hover:bg-obsidian-hover' : ''}`}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, item, item.type)}
      >
        {item.type === 'folder' ? (
          <AiOutlineFolder className={`text-obsidian-accent ${isOpen ? 'text-opacity-100' : 'text-opacity-70'}`} />
        ) : (
          <AiOutlineFile className="text-obsidian-text text-opacity-70" />
        )}
        {isEditing ? (
          <input
            type="text"
            defaultValue={item.name}
            onBlur={(e) => onRename(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-obsidian-bg text-obsidian-text border-obsidian-border focus:border-obsidian-accent focus:ring-1 focus:ring-obsidian-accent rounded-md shadow-sm w-full py-0 px-1"
            autoFocus
          />
        ) : (
          <span
            className="hover:text-obsidian-accent"
            onDoubleClick={() => setEditingId(item.id)}
          >
            {item.name}
          </span>
        )}
      </div>
      {item.type === 'folder' && isOpen && children && (
        <ul className="pl-4 list-none">
          {children}
        </ul>
      )}
    </li>
  );
}

FileExplorerItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['file', 'folder']).isRequired,
    parentId: PropTypes.string,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onRename: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  setEditingId: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onFileClick: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default FileExplorerItem;