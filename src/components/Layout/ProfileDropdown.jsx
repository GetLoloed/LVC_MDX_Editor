import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWorkspaces, saveWorkspace, deleteWorkspaceFromDB, setCurrentWorkspace } from '../../store/authSlice';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineCheck } from 'react-icons/ai';

function ProfileDropdown() {
  const dispatch = useDispatch();
  const { currentWorkspace, workspaces } = useSelector(state => state.auth);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Effet pour récupérer les workspaces de l'utilisateur
  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  // Fonction pour ajouter un nouveau workspace
  const handleAddWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace = { id: Date.now().toString(), name: newWorkspaceName };
      dispatch(saveWorkspace(newWorkspace));
      setNewWorkspaceName('');
    }
  };

  // Fonction pour changer de workspace
  const handleSwitchWorkspace = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
  };

  // Fonction pour supprimer un workspace
  const handleDeleteWorkspace = (id) => {
    dispatch(deleteWorkspaceFromDB(id));
  };

  return (
    <div className="absolute right-0 mt-2 w-72 bg-obsidian-bg border border-obsidian-border rounded-md shadow-lg z-10 overflow-hidden">
      <div className="px-4 py-3 border-b border-obsidian-border">
        <p className="text-sm font-semibold text-obsidian-accent">Workspaces</p>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {workspaces.map(workspace => (
          <div
            key={workspace.id}
            className="flex items-center justify-between px-4 py-2 hover:bg-obsidian-hover transition-colors duration-150 ease-in-out"
          >
            <button
              className={`text-sm flex items-center ${currentWorkspace && currentWorkspace.id === workspace.id ? 'text-obsidian-accent font-semibold' : 'text-obsidian-text'}`}
              onClick={() => handleSwitchWorkspace(workspace)}
            >
              {currentWorkspace && currentWorkspace.id === workspace.id && (
                <AiOutlineCheck className="mr-2" />
              )}
              {workspace.name}
            </button>
            {workspace.name !== 'Default' && (
              <button
                className="text-obsidian-text hover:text-red-500 transition-colors duration-150 ease-in-out"
                onClick={() => handleDeleteWorkspace(workspace.id)}
              >
                <AiOutlineDelete />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-obsidian-border bg-obsidian-hover">
        <input
          type="text"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Nouveau workspace"
          className="w-full bg-obsidian-bg text-obsidian-text border border-obsidian-border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-obsidian-accent"
        />
        <button
          onClick={handleAddWorkspace}
          className="w-full flex items-center justify-center bg-obsidian-accent text-obsidian-bg px-4 py-2 rounded hover:bg-opacity-80 transition-colors duration-150 ease-in-out"
        >
          <AiOutlinePlus className="mr-2" />
          Ajouter un workspace
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;