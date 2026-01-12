/**
 * Utilitaires pour la manipulation des dates
 */
import { DATE_FORMATS } from '../config/constants'

/**
 * Formate une date selon le format spécifié
 * @param {string|Date} dateString - Date à formater
 * @param {Object} [format] - Format de date (par défaut: SHORT)
 * @returns {string} Date formatée
 */
export function formatDate(dateString, format = DATE_FORMATS.SHORT) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('fr-FR', format)
}

/**
 * Vérifie si une candidature nécessite une relance
 * @param {string} dateString - Date de candidature
 * @returns {Object|null} Informations sur la relance ou null
 */
export function isPendingReview(dateString) {
  if (!dateString) return null;

  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  switch(true) {
    case diffDays >= 8:
      return {
        days: diffDays,
        color: 'red',
        label: 'Relance à faire : ' + diffDays + ' jours passés'
      }
    case diffDays >= 4:
      return {
        days: diffDays,
        color: 'orange',
        label: 'candidature en attente depuis ' + diffDays + ' jours'
      }
    default:
      const pluriel = (diffDays > 1) ? 'jours' : 'jour';
      return {
        days: diffDays,
        color: 'green',
        label: 'candidature en attente depuis ' + diffDays + ' ' + pluriel
      }
  }  
}

/**
 * Formate une date de commentaire en format relatif
 * @param {string|number} timestampOrDate - Timestamp ou date ISO
 * @returns {string} Date formatée en format relatif
 */
export function formatCommentDate(timestampOrDate) {
  if (!timestampOrDate) return '';
  
  // Si c'est un timestamp (nombre), on le convertit directement
  // Si c'est une date ISO string, on la parse
  let date;
  if (typeof timestampOrDate === 'number') {
    date = new Date(timestampOrDate);
  } else {
    date = new Date(timestampOrDate);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', DATE_FORMATS.DATETIME);
  }
}

/**
 * Tronque un lien si trop long
 * @param {string} link - Lien à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Lien tronqué
 */
export function truncateLink(link, maxLength = 60) {
  if (!link || link.length <= maxLength) {
    return link;
  }
  const start = Math.floor(maxLength / 2) - 3;
  const end = link.length - (Math.floor(maxLength / 2) - 3);
  return link.substring(0, start) + '...' + link.substring(end);
}

export default {
  formatDate,
  isPendingReview,
  formatCommentDate,
  truncateLink
}

