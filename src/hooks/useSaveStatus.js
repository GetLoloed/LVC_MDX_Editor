import { useState, useCallback } from 'react';

// Permet de gérer le statut de sauvegarde
export function useSaveStatus() {
  // État pour stocker le statut de sauvegarde actuel
  const [saveStatus, setSaveStatus] = useState(null);

  // Fonction mémorisée pour afficher le statut de sauvegarde
  const showSaveStatus = useCallback((status) => {
    // Définir le nouveau statut
    setSaveStatus(status);
    // Effacer le statut après 2 secondes
    setTimeout(() => setSaveStatus(null), 2000);
  }, []);

  // Retourner le statut et la fonction pour le mettre à jour
  return { saveStatus, showSaveStatus };
}