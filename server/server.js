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
store.init();

app.use("/todos", todosRoutes);
app.use("/tags", tagsRoutes);
app.use("/jobs", jobsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("=".repeat(50));
  console.log("🚀 Backend listening on http://localhost:" + port);
  console.log("📝 Les logs apparaîtront ici quand vous utiliserez l'API");
  console.log("=".repeat(50));
});
