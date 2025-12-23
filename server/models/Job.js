module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    job: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    job_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true
    },
    language: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('language');
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return Array.isArray(value) ? value : [];
        }
      },
      set(value) {
        this.setDataValue('language', Array.isArray(value) ? JSON.stringify(value) : value);
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'jobs',
    timestamps: false
  });

  return Job;
};

