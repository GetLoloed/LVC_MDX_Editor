// Middleware pour sauvegarder l'état Redux dans le localStorage
const localStorageMiddleware = store => next => action => {
  // Exécute l'action et obtient le résultat
  const result = next(action);
  
  // Sauvegarde l'état complet du store dans le localStorage
  // L'état est converti en chaîne JSON pour le stockage
  localStorage.setItem('reduxState', JSON.stringify(store.getState()));
  
  // Retourne le résultat de l'action
  return result;
};

export default localStorageMiddleware;