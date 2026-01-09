/**
 * @deprecated Utilisez les fonctions de utils/date.utils.js à la place
 * Ce fichier est conservé pour la compatibilité ascendante
 */
import { formatDate as formatDateUtil, isPendingReview as isPendingReviewUtil, formatCommentDate as formatCommentDateUtil, truncateLink as truncateLinkUtil } from './date.utils'

// Réexporter pour compatibilité
export const formatDate = formatDateUtil
export const isPendingReview = isPendingReviewUtil
export const formatCommentDate = formatCommentDateUtil
export const truncateLink = truncateLinkUtil