// Point d'entrée pour Zeabur - redirige vers le serveur
const path = require('path');
process.chdir(path.join(__dirname, 'server'));
require(path.join(__dirname, 'server', 'server.js'));

