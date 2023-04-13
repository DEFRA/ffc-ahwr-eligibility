module.exports = (sequelize, DataTypes) => {
  const waitingList = sequelize.define('waiting_list', {
    business_email: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    created_at: DataTypes.DATE,
    access_granted: DataTypes.BOOLEAN,
    access_granted_at: DataTypes.DATE
  },
  {
    tableName: 'waiting_list',
    freezeTableName: true,
    timestamps: false
  })
  return waitingList
}
