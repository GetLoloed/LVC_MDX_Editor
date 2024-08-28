import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { selectBlocs } from '../../utils/selector';
import { ajouterBloc, modifierBloc, supprimerBloc, renommerBloc } from '../../features/blocsSlice';

const Blocs = () => {
  const dispatch = useDispatch();
  const blocs = useSelector(selectBlocs);
  const [editingBlocId, setEditingBlocId] = useState(null);
  const [newBlocName, setNewBlocName] = useState('');
  const [newBlocContent, setNewBlocContent] = useState('');

  useEffect(() => {
    console.log('Blocs:', blocs);
  }, [blocs]);

  const handleCreateBloc = () => {
    dispatch(ajouterBloc({ nom: 'Nouveau bloc', contenu: '' }));
  };

  const handleEditBloc = (bloc) => {
    setEditingBlocId(bloc.id);
    setNewBlocName(bloc.nom);
    setNewBlocContent(bloc.contenu);
  };

  const handleSaveBloc = () => {
    if (editingBlocId) {
      dispatch(modifierBloc({ id: editingBlocId, nom: newBlocName, contenu: newBlocContent }));
    } else {
      dispatch(ajouterBloc({ nom: newBlocName, contenu: newBlocContent }));
    }
    setEditingBlocId(null);
    setNewBlocName('');
    setNewBlocContent('');
  };

  const handleDeleteBloc = (id) => {
    dispatch(supprimerBloc(id));
  };

  const handleExportBloc = (bloc) => {
    const blob = new Blob([bloc.contenu], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bloc.nom}.part.mdlc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAllBlocs = () => {
    const blocsContent = JSON.stringify(blocs);
    const blob = new Blob([blocsContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blocs.part.ts.mdlc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBloc = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        dispatch(ajouterBloc({ nom: file.name.replace('.part.mdlc', ''), contenu: content }));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des blocs personnalisés</h1>
      <div className="mb-4">
        <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
          Retour à l'accueil
        </Link>
        <button
          onClick={handleCreateBloc}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          <FaPlus className="inline mr-2" /> Créer un nouveau bloc
        </button>
        <button
          onClick={handleExportAllBlocs}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          <FaDownload className="inline mr-2" /> Exporter tous les blocs
        </button>
        <input
          type="file"
          accept=".part.mdlc,.part.ts.mdlc"
          onChange={handleImportBloc}
          className="hidden"
          id="import-bloc"
        />
        <label
          htmlFor="import-bloc"
          className="bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          <FaUpload className="inline mr-2" /> Importer un bloc
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(blocs) && blocs.map((bloc) => (
          <div key={bloc.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">{bloc.nom}</h2>
            <div className="mb-2">
              <button
                onClick={() => handleEditBloc(bloc)}
                className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
              >
                <FaEdit className="inline mr-1" /> Modifier
              </button>
              <button
                onClick={() => handleDeleteBloc(bloc.id)}
                className="bg-red-500 text-white px-2 py-1 rounded mr-2"
              >
                <FaTrash className="inline mr-1" /> Supprimer
              </button>
              <button
                onClick={() => handleExportBloc(bloc)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                <FaDownload className="inline mr-1" /> Exporter
              </button>
            </div>
            <pre className="bg-gray-100 p-2 rounded">{bloc.contenu.substring(0, 100)}...</pre>
          </div>
        ))}
      </div>
      {editingBlocId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Modifier le bloc</h2>
            <input
              type="text"
              value={newBlocName}
              onChange={(e) => setNewBlocName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
              placeholder="Nom du bloc"
            />
            <textarea
              value={newBlocContent}
              onChange={(e) => setNewBlocContent(e.target.value)}
              className="w-full h-40 mb-2 p-2 border rounded"
              placeholder="Contenu du bloc (HTML/Markdown)"
            />
            <div>
              <button
                onClick={handleSaveBloc}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditingBlocId(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blocs;