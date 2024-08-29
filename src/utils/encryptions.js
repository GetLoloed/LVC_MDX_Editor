const ENCRYPTION_KEY = 'VotreCléSecrète'; // Remplacez par une clé sécurisée

export function encryptData(data) {
  // Ajout d'une vérification supplémentaire pour le type de données
  if (typeof data !== 'string' && typeof data !== 'object') {
    console.error('Les données à chiffrer doivent être une chaîne ou un objet');
    return '';
  }
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const result = [];
  for(let i = 0; i < text.length; i++) {
    result.push(String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)));
  }
  return btoa(result.join(''));
}

export function decryptData(encryptedData) {
  // Ajout d'une vérification supplémentaire pour le type de données chiffrées
  if (typeof encryptedData !== 'string') {
    console.error('Les données chiffrées doivent être une chaîne');
    return '';
  }
  const text = atob(encryptedData);
  const result = [];
  for(let i = 0; i < text.length; i++) {
    result.push(String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)));
  }
  try {
    return JSON.parse(result.join(''));
  } catch (e) {
    return result.join('');
  }
}