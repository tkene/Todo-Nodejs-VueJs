const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const userModule = require('../modules/users');

// Route pour vérifier l'état de la session
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      email: req.session.email
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // 1. Chercher l'utilisateur par email dans la base de données
    const user = await userModule.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 2. Vérifier le mot de passe avec bcrypt.compare()
    const isValidPassword = await userModule.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 3. Créer la session si les credentials sont valides
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.createdAt = new Date();

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: req.session.userId,
        email: req.session.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la connexion',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Déconnexion réussie' });
  });
});

// Route pour vérifier si une route nécessite une authentification
router.get('/check', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    userId: req.session.userId,
    email: req.session.email
  });
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Créer l'utilisateur
    const user = await userModule.createUser({ email, password });

    // Créer automatiquement une session après l'inscription
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.createdAt = new Date();

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Gérer l'erreur d'email déjà utilisé
    if (error.message === 'Cet email est déjà utilisé') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'inscription',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

