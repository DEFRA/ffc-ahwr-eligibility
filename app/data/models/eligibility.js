module.exports = (sequelize, DataTypes) => {
  const eligibility = sequelize.define('eligibility', {
    sbi: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    crn: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    customer_name: DataTypes.STRING,
    business_name: DataTypes.STRING,
    business_email: DataTypes.STRING,
    business_address: DataTypes.STRING,
    last_updated_at: DataTypes.DATE,
    waiting_updated_at: DataTypes.DATE,
    access_granted: DataTypes.BOOLEAN
  },
  {
    tableName: 'customer',
    freezeTableName: true,
    timestamps: false
  })
  return eligibility
}
