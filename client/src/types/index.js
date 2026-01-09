/**
 * Types et interfaces pour l'application
 * (JavaScript avec JSDoc pour la documentation et l'autocomplétion)
 */

/**
 * @typedef {Object} User
 * @property {number} id - ID de l'utilisateur
 * @property {string} email - Email de l'utilisateur
 * @property {string} [role] - Rôle de l'utilisateur
 */

/**
 * @typedef {Object} Job
 * @property {number} id - ID de la candidature
 * @property {string} company - Nom de l'entreprise
 * @property {string} job - Intitulé du poste
 * @property {string} status - Statut de la candidature
 * @property {string} date - Date de candidature
 * @property {string} [job_link] - Lien de l'offre
 * @property {string[]} [language] - Langages de programmation
 * @property {string} [contactName] - Nom du contact
 * @property {string} [contactEmail] - Email du contact
 * @property {string} [contactPhone] - Téléphone du contact
 * @property {string} [platform] - Plateforme de candidature
 * @property {Comment[]} [comments] - Commentaires associés
 */

/**
 * @typedef {Object} Comment
 * @property {number} id - ID du commentaire
 * @property {string} comment - Contenu du commentaire
 * @property {string|number} [createdAt] - Date de création
 * @property {number} [jobId] - ID de la candidature associée
 */

/**
 * @typedef {Object} Todo
 * @property {number} id - ID de la tâche
 * @property {string} text - Texte de la tâche
 * @property {boolean} done - État de complétion
 * @property {number[]|string[]} [tags] - Tags associés
 */

/**
 * @typedef {Object} Tag
 * @property {number} id - ID du tag
 * @property {string} name - Nom du tag
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Indique si la requête a réussi
 * @property {*} [data] - Données de la réponse
 * @property {string} [error] - Message d'erreur
 * @property {string} [message] - Message de succès
 */

/**
 * @typedef {Object} NotificationOptions
 * @property {string} [type] - Type de notification (success, error, warning, info)
 * @property {string} [icon] - Icône à afficher
 * @property {string} [position] - Position de la notification
 * @property {number} [timeout] - Durée d'affichage en ms
 */

/**
 * @typedef {Object} RouteMeta
 * @property {boolean} [requiresAuth] - Requiert une authentification
 * @property {boolean} [hideInMenu] - Masquer dans le menu
 * @property {string} [icon] - Icône à afficher dans le menu
 * @property {string} [title] - Titre de la route
 */

export default {}

