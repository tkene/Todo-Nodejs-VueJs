module.exports = (sequelize, DataTypes) => {
  const Race = sequelize.define('Race', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Identifiant unique de la course (ex: R1C8)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom de la course'
    },
    surface: {
      type: DataTypes.ENUM('PSF', 'Herbe'),
      allowNull: false,
      comment: 'Type de surface (PSF ou Herbe)'
    },
    hippodrome: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom de l\'hippodrome (ex: Deauville)'
    },
    corde: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Position de la corde'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'races',
    timestamps: true
  });

  return Race;
};

