import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCubes, FaImages, FaBars, FaTimes, FaKeyboard } from 'react-icons/fa';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-700' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleShortcutsModal = () => {
    setIsShortcutsModalOpen(!isShortcutsModalOpen);
  };

  const navItems = [
    { path: '/', icon: FaHome, text: 'Accueil' },
    { path: '/blocs', icon: FaCubes, text: 'Gérer les blocs personnalisés' },
    { path: '/images', icon: FaImages, text: 'Gérer la bibliothèque d\'images' },
  ];

  const shortcuts = [
    { key: 'Ctrl + S', description: 'Sauvegarder' },
    { key: 'Ctrl + Z', description: 'Annuler' },
    { key: 'Ctrl + Y', description: 'Rétablir' },
    { key: 'Ctrl + B', description: 'Gras' },
    { key: 'Ctrl + I', description: 'Italique' },
    { key: 'Ctrl + K', description: 'Insérer un lien' },
    { key: 'Ctrl + `', description: 'Code inline' },
  ];

  return (
    <>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="text-blue-500">MDX</span>
              <span className="text-xs ml-2 bg-blue-500 text-white px-2 py-1 rounded">Beta</span>
            </Link>
            <ul className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center hover:text-gray-300 px-3 py-2 rounded-md ${isActive(item.path)}`}
                  >
                    <item.icon className="mr-2" />
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center">
              <button
                onClick={toggleShortcutsModal}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
              >
                <FaKeyboard className="mr-2" />
                Raccourcis
              </button>
              <button
                className="md:hidden ml-4 focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <ul className="mt-4 md:hidden">
              {navItems.map((item) => (
                <li key={item.path} className="mb-2">
                  <Link
                    to={item.path}
                    className={`flex items-center hover:text-gray-300 px-3 py-2 rounded-md ${isActive(item.path)}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="mr-2" />
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {isShortcutsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Raccourcis clavier</h2>
            <ul className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <li key={index} className="flex justify-between">
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded">{shortcut.key}</span>
                  <span>{shortcut.description}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={toggleShortcutsModal}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;