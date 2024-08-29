import PropTypes from 'prop-types';
import { FaPlus, FaCheckSquare, FaSquare, FaFileExport } from 'react-icons/fa';

function ActionButtons({ onCreateItem, onToggleSelectAll, onExportItems, isAllSelected, isExporting, exportDisabled, showCreateButton }) {
  return (
    // Conteneur principal des boutons d'action
    <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      {/* Bouton de création, affiché conditionnellement */}
      {showCreateButton && (
        <button
          onClick={onCreateItem}
          className="bg-blue-700 hover:bg-blue-600 text-gray-200 font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Créer
        </button>
      )}
      {/* Bouton pour sélectionner/désélectionner tous les éléments */}
      <button
        onClick={onToggleSelectAll}
        className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
      >
        {isAllSelected ? <FaCheckSquare className="mr-2" /> : <FaSquare className="mr-2" />}
        {isAllSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
      </button>
      {/* Bouton pour exporter les éléments sélectionnés */}
      <button
        onClick={onExportItems}
        className="bg-green-700 hover:bg-green-600 text-gray-200 font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
        disabled={exportDisabled || isExporting}
      >
        <FaFileExport className="mr-2" />
        {isExporting ? 'Exportation...' : 'Exporter les éléments sélectionnés'}
      </button>
    </div>
  );
}

// Définition des types de props attendus
ActionButtons.propTypes = {
  onCreateItem: PropTypes.func,
  onToggleSelectAll: PropTypes.func.isRequired,
  onExportItems: PropTypes.func.isRequired,
  isAllSelected: PropTypes.bool.isRequired,
  isExporting: PropTypes.bool.isRequired,
  exportDisabled: PropTypes.bool.isRequired,
  showCreateButton: PropTypes.bool
};

// Valeurs par défaut pour certaines props
ActionButtons.defaultProps = {
  showCreateButton: true,
  onCreateItem: () => { }
};

export default ActionButtons;