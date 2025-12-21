require('dotenv').config();
const express = require("express");
const cors = require("cors");
const store = require("./modules/store");
const todosRoutes = require("./routes/todos");
const tagsRoutes = require("./routes/tags");
const jobsRoutes = require("./routes/jobs");

const app = express();

// Configuration CORS pour la production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true),
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialiser le store au démarrage
try {
  store.init();
  console.log('✅ Store initialized successfully');
} catch (error) {
  console.error('❌ Error initializing store:', error);
  // Ne pas faire crash le serveur, continuer quand même
}

// Health check endpoint pour Zeabur
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/todos", todosRoutes);
app.use("/tags", tagsRoutes);
app.use("/jobs", jobsRoutes);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Backend listening on http://${host}:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
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
