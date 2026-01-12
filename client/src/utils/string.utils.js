/**
 * Utilitaires pour la manipulation de chaînes
 */

/**
 * Capitalise la première lettre d'une chaîne
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} Chaîne capitalisée
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formate un nom de route pour l'affichage
 * @param {string} routeName - Nom de la route
 * @returns {string} Nom formaté
 */
export function formatRouteName(routeName) {
  if (!routeName) return ''
  return routeName
    .split('-')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Tronque une chaîne avec ellipsis
 * @param {string} str - Chaîne à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Chaîne tronquée
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * Supprime les accents d'une chaîne
 * @param {string} str - Chaîne à traiter
 * @returns {string} Chaîne sans accents
 */
export function removeAccents(str) {
  if (!str) return ''
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Formate un texte en slug
 * @param {string} text - Texte à formater
 * @returns {string} Slug
 */
export function slugify(text) {
  if (!text) return ''
  return removeAccents(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default {
  capitalize,
  formatRouteName,
  truncate,
  removeAccents,
  slugify
}

