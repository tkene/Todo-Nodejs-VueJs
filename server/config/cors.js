/**
 * Configuration CORS pour Express
 * 
 * @module config/cors
 */

/**
 * Configuration CORS selon l'environnement
 * @returns {Object} Options CORS
 */
function getCorsOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // En production, utiliser CORS_ORIGIN si défini, sinon désactiver CORS
  // En développement, autoriser les origines locales
  const origin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : (isProduction 
      ? false 
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ]);

  return {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 heures
  };
}

module.exports = {
  getCorsOptions,
};

