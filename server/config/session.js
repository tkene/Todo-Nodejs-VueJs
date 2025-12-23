const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

module.exports = session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '../'),
    table: 'sessions',
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || 'votre-secret-session-changez-moi-en-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS en production
    httpOnly: true, // Empêche l'accès via JavaScript
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: 'lax' // Protection CSRF
  },
  name: 'sessionId' // Nom du cookie de session
});

