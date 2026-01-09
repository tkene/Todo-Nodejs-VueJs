/**
 * Utilitaires de validation
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone (format français)
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
export function isValidPhone(phone) {
  if (!phone) return false
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} True si l'URL est valide
 */
export function isValidUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valide qu'une valeur n'est pas vide
 * @param {*} value - Valeur à valider
 * @returns {boolean} True si la valeur n'est pas vide
 */
export function isNotEmpty(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Valide une longueur minimale
 * @param {string} value - Valeur à valider
 * @param {number} minLength - Longueur minimale
 * @returns {boolean} True si la longueur est valide
 */
export function hasMinLength(value, minLength) {
  if (!value) return false
  return value.length >= minLength
}

/**
 * Valide une longueur maximale
 * @param {string} value - Valeur à valider
 * @param {number} maxLength - Longueur maximale
 * @returns {boolean} True si la longueur est valide
 */
export function hasMaxLength(value, maxLength) {
  if (!value) return true
  return value.length <= maxLength
}

export default {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isNotEmpty,
  hasMinLength,
  hasMaxLength
}

