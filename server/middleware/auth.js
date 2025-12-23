/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 * Utilisez ce middleware sur les routes qui nécessitent une authentification
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ 
    error: 'Non authentifié',
    message: 'Vous devez être connecté pour accéder à cette ressource'
  });
};

/**
 * Middleware optionnel pour vérifier l'authentification
 * Ne bloque pas la requête, mais ajoute req.isAuthenticated
 */
const optionalAuth = (req, res, next) => {
  req.isAuthenticated = !!(req.session && req.session.userId);
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};

