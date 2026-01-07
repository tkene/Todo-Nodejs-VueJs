module.exports = (sequelize, DataTypes) => {
  const ForumInsight = sequelize.define('ForumInsight', {
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
    horseId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'horses',
        key: 'id'
      },
      comment: 'Référence au cheval'
    },
    sentiment: {
      type: DataTypes.ENUM('très_positif', 'positif', 'neutre', 'négatif', 'très_négatif'),
      allowNull: false,
      defaultValue: 'neutre',
      comment: 'Sentiment global du forum sur le cheval'
    },
    sentimentScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Score numérique du sentiment (-100 à +100)'
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Nombre de commentaires analysés'
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
    tableName: 'forum_insights',
    timestamps: true
  });

  return ForumInsight;
};

