const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config')
const dbConfig = config.dbConfig[config.env]
const modelPath = path.join(__dirname, 'models')
const db = {}

console.log(dbConfig.database)
console.log(dbConfig.username)
console.log(dbConfig.password)

let sequelize

try {
  console.log('Attempting to setup sequalize.')
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    define: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    },
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    logging: function (str) {
      console.log('inside of sequalize logging function')
      console.log(str)
    },
    schema: process.env.POSTGRES_SCHEMA_NAME
  })
  console.log('After sequalize constructor')
} catch (error) {
  console.error('Error during sequalize', error)
}

const sequaliseCheck = async () => {
  try {
    console.log('Attempting to establish connection.')
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

sequaliseCheck()

fs.readdirSync(modelPath)
  .filter(file => {
    console.log(`file is ${file}`)
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    console.log(`processing file ${file}`)
    const model = require(path.join(modelPath, file))(sequelize, DataTypes)
    console.log(`model name ${model.name}`)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
