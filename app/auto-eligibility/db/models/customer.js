module.exports = (sequelize, DataTypes) => {
  const customer = sequelize.define('customer', {
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
    business_email: {
      type: DataTypes.CITEXT
    },
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
  return customer
}
