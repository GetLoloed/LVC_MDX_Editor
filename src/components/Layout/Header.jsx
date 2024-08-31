import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AiOutlineMenu, AiOutlineFile, AiOutlineAppstore, AiOutlinePicture, AiOutlineEye, AiOutlineSwap } from 'react-icons/ai';
import ProfileDropdown from './ProfileDropdown';
import PropTypes from 'prop-types';

function Header({ toggleFileExplorer, togglePreview }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const currentWorkspace = useSelector(state => state.auth.currentWorkspace);

  return (
    <header className="bg-obsidian-hover border-b border-obsidian-border p-2">
      <div className="flex flex-wrap items-center space-x-2 md:space-x-4">
        <button
          className="text-obsidian-text hover:text-obsidian-accent"
          onClick={toggleFileExplorer}
        >
          <AiOutlineMenu className="text-xl" />
        </button>
        <Link to="/" className="text-obsidian-text hover:text-obsidian-accent">
          <AiOutlineFile className="text-xl" />
        </Link>
        <Link to="/blocks" className="text-obsidian-text hover:text-obsidian-accent">
          <AiOutlineAppstore className="text-xl" />
        </Link>
        <Link to="/images" className="text-obsidian-text hover:text-obsidian-accent">
          <AiOutlinePicture className="text-xl" />
        </Link>
        <button
          className="md:hidden text-obsidian-text hover:text-obsidian-accent"
          onClick={togglePreview}
        >
          <AiOutlineEye className="text-xl" />
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <button
            className="text-obsidian-text hover:text-obsidian-accent flex items-center"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <AiOutlineSwap className="text-xl mr-2" />
            <span className="text-sm">{currentWorkspace ? currentWorkspace.name : 'Sélectionner un workspace'}</span>
          </button>
          {showProfileDropdown && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  toggleFileExplorer: PropTypes.func.isRequired,
  togglePreview: PropTypes.func.isRequired,
};

export default Header;