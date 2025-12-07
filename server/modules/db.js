const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

function readDB() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    // Gérer l'ancien format (tableau) et le nouveau format (objet)
    if (Array.isArray(data)) {
      return { todos: data, tags: [] };
    }
    return { todos: data.todos || [], tags: data.tags || [] };
  } catch (e) {
    return { todos: [], tags: [] };
  }
}

function writeDB(todos, tags) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ todos: todos || [], tags: tags || [] }, null, 2));
}

module.exports = {
  readDB,
  writeDB,
  DB_PATH
};

