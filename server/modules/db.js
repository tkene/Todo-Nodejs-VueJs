const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "db.json");

// S'assurer que le répertoire existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function readDB() {
  try {
    // Si le fichier n'existe pas, le créer avec une structure vide
    if (!fs.existsSync(DB_PATH)) {
      const initialData = { todos: [], tags: [], jobs: [], comments: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    // Gérer l'ancien format (tableau) et le nouveau format (objet)
    if (Array.isArray(data)) {
      return { todos: data, tags: [], jobs: [], comments: [] };
    }
    return { 
      todos: data.todos || [], 
      tags: data.tags || [],
      jobs: data.jobs || [],
      comments: data.comments || []
    };
  } catch (e) {
    console.error('❌ Error reading DB:', e.message);
    // Retourner une structure vide en cas d'erreur
    return { todos: [], tags: [], jobs: [], comments: [] };
  }
}

function writeDB(todos, tags, jobs, comments) {
  try {
    const data = { 
      todos: todos || [], 
      tags: tags || [],
      jobs: jobs || [],
      comments: comments || []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Error writing DB:', e.message);
    throw e;
  }
}

module.exports = {
  readDB,
  writeDB,
  DB_PATH
};

