const db = require('../models');
const bcrypt = require('bcryptjs');

async function createUser(userData) {
  const { email, password } = userData;
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Créer l'utilisateur
  const user = await db.User.create({
    id: Date.now(),
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Retourner l'utilisateur sans le mot de passe
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function findUserByEmail(email) {
  const user = await db.User.findOne({ where: { email } });
  return user;
}

async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

module.exports = {
  createUser,
  findUserByEmail,
  verifyPassword
};

