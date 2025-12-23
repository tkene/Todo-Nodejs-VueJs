require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcryptjs');

async function createInitialUsers() {
  try {
    console.log('🔐 Création des utilisateurs initiaux...\n');

    // Connexion à la base de données
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: false });
    console.log('✅ Connexion à la base de données établie\n');

    // Utilisateur 1 : Admin
    const adminEmail = 'jobsecker@jobsecker.com';
    const adminPassword = 'jobsecker2025';

    // Vérifier si l'admin existe déjà
    let admin = await db.User.findOne({ where: { email: adminEmail } });
    if (admin) {
      console.log(`⚠️  L'utilisateur admin (${adminEmail}) existe déjà`);
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      admin = await db.User.create({
        id: Date.now(),
        email: adminEmail,
        password: hashedAdminPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Utilisateur ADMIN créé avec succès !');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Créé le: ${admin.createdAt}\n`);
    }

    // Utilisateur 2 : Recruteur
    const recruiterEmail = 'recruteur@jobsecker.com';
    const recruiterPassword = 'recruteur2025';

    // Vérifier si le recruteur existe déjà
    let recruiter = await db.User.findOne({ where: { email: recruiterEmail } });
    if (recruiter) {
      console.log(`⚠️  L'utilisateur recruteur (${recruiterEmail}) existe déjà`);
    } else {
      const hashedRecruiterPassword = await bcrypt.hash(recruiterPassword, 10);
      recruiter = await db.User.create({
        id: Date.now() + 1, // S'assurer que l'ID est différent
        email: recruiterEmail,
        password: hashedRecruiterPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Utilisateur RECRUTEUR créé avec succès !');
      console.log(`   ID: ${recruiter.id}`);
      console.log(`   Email: ${recruiter.email}`);
      console.log(`   Créé le: ${recruiter.createdAt}\n`);
    }

    console.log('📋 Résumé des utilisateurs créés :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 RECRUTEUR');
    console.log(`   Email: ${recruiterEmail}`);
    console.log(`   Mot de passe: ${recruiterPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Tous les utilisateurs sont prêts !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

createInitialUsers();

