const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config')
const dbConfig = config.dbConfig[config.env]
const modelPath = path.join(__dirname, 'models')
const db = {}

console.log(`db config`)
console.log(dbConfig)
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig)

console.log(`sequalise`)
console.log(sequelize)

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
