import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import BlocEditor from '../components/BlocEditor';
import DragDropZone from '../components/DragDropZone';
import ActionButtons from '../components/ActionButtons';
import {
  createBloc,
  editBloc,
  deleteBloc,
  renameBloc,
  importBlocs,
  initializeBlocsIfNeeded,
  saveBlocsToStorage
} from '../redux/actions/BlocActions';
import { useFileExport } from '../hooks/useFileExport';
import { useSelection } from '../hooks/useSelection';
import { FaCheckSquare, FaSquare, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

function BlocsPage() {
  const blocs = useSelector(state => state.blocs);
  const dispatch = useDispatch();
  const [editingBloc, setEditingBloc] = useState(null);
  const [expandedBlocs, setExpandedBlocs] = useState({});

  const { exportBloc, exportBlocs, importBloc, importBlocs: importBlocsHook, isExporting, isImporting } = useFileExport();
  const { selectedItems: selectedBlocs, toggleSelectItem: toggleSelectBloc, toggleSelectAll } = useSelection(blocs);

  useEffect(() => {
    dispatch(initializeBlocsIfNeeded());
  }, [dispatch]);

  const handleCreateBloc = useCallback(() => {
    dispatch(createBloc('Nouveau bloc personnalisé', ''));
    dispatch(saveBlocsToStorage());
  }, [dispatch]);

  const handleEditBloc = useCallback((bloc) => {
    setEditingBloc(bloc);
  }, []);

  const handleSaveBloc = useCallback((updatedBloc) => {
    dispatch(editBloc(updatedBloc.id, updatedBloc.content));
    dispatch(renameBloc(updatedBloc.id, updatedBloc.name));
    dispatch(saveBlocsToStorage());
    setEditingBloc(null);
  }, [dispatch]);

  const handleDeleteBloc = useCallback((blocId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      dispatch(deleteBloc(blocId));
      dispatch(saveBlocsToStorage());
      toggleSelectBloc(blocId);
    }
  }, [dispatch, toggleSelectBloc]);

  const handleRenameBloc = useCallback((blocId, newName) => {
    dispatch(renameBloc(blocId, newName));
    dispatch(saveBlocsToStorage());
  }, [dispatch]);

  const handleExportBlocs = useCallback(() => {
    const selectedBlocsData = blocs.filter(bloc => selectedBlocs.includes(bloc.id));
    if (selectedBlocsData.length === 1) {
      exportBloc(selectedBlocsData[0]);
    } else {
      exportBlocs(selectedBlocsData);
    }
  }, [blocs, selectedBlocs, exportBloc, exportBlocs]);

  const handleImportBlocs = useCallback((files) => {
    Array.from(files).forEach(file => {
      if (file.name.endsWith('.part.mdlc')) {
        importBloc(file, (bloc) => {
          dispatch(importBlocs([bloc]));
          dispatch(saveBlocsToStorage());
        });
      } else if (file.name.endsWith('.parts.mdlc')) {
        importBlocsHook(file, (blocs) => {
          dispatch(importBlocs(blocs));
          dispatch(saveBlocsToStorage());
        });
      }
    });
  }, [dispatch, importBloc, importBlocsHook]);

  const toggleExpandBloc = useCallback((blocId) => {
    setExpandedBlocs(prev => ({
      ...prev,
      [blocId]: !prev[blocId]
    }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="flex-1 p-4 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6">Gestion des blocs personnalisés</h1>
        <DragDropZone
          onDrop={handleImportBlocs}
          isImporting={isImporting}
          acceptedFileTypes=".part.mdlc,.parts.mdlc"
          className="mb-6"
        >
          Glissez et déposez vos fichiers de blocs ici ou cliquez pour sélectionner
        </DragDropZone>
        <ActionButtons
          onCreateItem={handleCreateBloc}
          onToggleSelectAll={toggleSelectAll}
          onExportItems={handleExportBlocs}
          isAllSelected={selectedBlocs.length === blocs.length}
          isExporting={isExporting}
          exportDisabled={selectedBlocs.length === 0}
          className="mb-6"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {blocs.map((bloc, index) => (
            <div key={bloc.id} className="bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={bloc.name}
                    onChange={(e) => handleRenameBloc(bloc.id, e.target.value)}
                    className="w-full px-2 py-1 text-lg font-semibold bg-transparent text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpandBloc(bloc.id)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      {expandedBlocs[bloc.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleSelectBloc(bloc.id)}
                    >
                      {selectedBlocs.includes(bloc.id) ? (
                        <FaCheckSquare className="text-blue-500 text-xl" />
                      ) : (
                        <FaSquare className="text-gray-500 text-xl" />
                      )}
                    </div>
                  </div>
                </div>
                <div className={`mt-2 bg-gray-700 p-3 rounded transition-all duration-300 ${expandedBlocs[bloc.id] ? 'max-h-96' : 'max-h-20'} overflow-y-auto`}>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {bloc.content}
                  </pre>
                </div>
              </div>
              <div className="bg-gray-750 p-3 flex justify-between">
                <button
                  onClick={() => handleEditBloc(bloc)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                >
                  <FaEdit className="mr-2" /> Éditer
                </button>
                <button
                  onClick={() => handleDeleteBloc(bloc.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                >
                  <FaTrash className="mr-2" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingBloc && (
        <BlocEditor
          bloc={editingBloc}
          onSave={handleSaveBloc}
          onClose={() => setEditingBloc(null)}
        />
      )}
    </div>
  );
}

export default React.memo(BlocsPage);