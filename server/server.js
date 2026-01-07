require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./models");
const sessionConfig = require("./config/session");
const todosRoutes = require("./routes/todos");
const tagsRoutes = require("./routes/tags");
const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");

const app = express();

// Configuration CORS pour la production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' 
    ? false 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Configuration des sessions (doit être avant les routes)
app.use(sessionConfig);

// Initialiser Sequelize au démarrage
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    
    // Exécuter les migrations Sequelize automatiquement au démarrage
    if (process.env.AUTO_MIGRATE !== 'false') {
      try {
        console.log('🔄 Exécution des migrations Sequelize...');
        const { execSync } = require('child_process');
        // Utiliser 'production' si DB_HOST est défini (MySQL), sinon l'environnement actuel
        const migrationEnv = process.env.DB_HOST ? 'production' : (process.env.NODE_ENV || 'development');
        execSync('npx sequelize-cli db:migrate', { 
          stdio: 'pipe',
          cwd: __dirname,
          env: { ...process.env, NODE_ENV: migrationEnv }
        });
        console.log('✅ Migrations Sequelize exécutées avec succès.');
      } catch (migrationError) {
        // Si les migrations échouent, continuer quand même (peut-être déjà exécutées)
        console.log('ℹ️  Note: Les migrations peuvent déjà être à jour.');
      }
    }
    
    // Synchroniser les modèles (créer les tables si elles n'existent pas)
    await db.sequelize.sync({ alter: false });
    console.log('✅ Base de données synchronisée.');
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données:', error);
    // Ne pas faire crash le serveur, continuer quand même
  }
})();

// Health check endpoint pour Zeabur
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes API (IMPORTANT: avant les fichiers statiques)
app.use("/api/auth", authRoutes);
app.use("/todos", todosRoutes);
app.use("/tags", tagsRoutes);
app.use("/jobs", jobsRoutes);

// Servir les fichiers statiques du frontend Vue.js
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// Pour toutes les autres routes, servir index.html (pour Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Backend listening on http://${host}:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving frontend from: ${clientPath}`);
  console.log("=".repeat(50));
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
