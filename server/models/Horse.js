module.exports = (sequelize, DataTypes) => {
  const Horse = sequelize.define('Horse', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    raceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'races',
        key: 'id'
      },
      comment: 'Référence à la course'
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Numéro du cheval dans la course'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom du cheval'
    },
    musique: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Musique du cheval (ex: 1-2-3)'
    },
    poids: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Poids porté par le cheval'
    },
    cote: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Cote actuelle du cheval'
    },
    coteInitiale: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Cote initiale du cheval'
    },
    performanceScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Score de performance calculé'
    },
    aptitudPSF: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Aptitude à la surface PSF'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'horses',
    timestamps: true
  });

  return Horse;
};

