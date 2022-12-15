const { DefaultAzureCredential } = require('@azure/identity')

function isProd () {
  return process.env.NODE_ENV === 'production'
}

console.log('inside of database.js')
console.log(process.env.POSTGRES_HOST)
console.log(process.env.POSTGRES_LOGGING)
console.log(process.env.POSTGRES_PASSWORD)
console.log(process.env.POSTGRES_PORT)
console.log(process.env.POSTGRES_SCHEMA_NAME)
console.log(process.env.POSTGRES_USERNAME)

console.log(process.env.NODE_ENV)

const hooks = {
  beforeConnect: async (cfg) => {
    console.log('inside of before connect')
    if (isProd()) {
      console.log('Setting production database conncetion config.')
      const credential = new DefaultAzureCredential()
      const accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net')
      cfg.password = accessToken.token
    }
    console.log('after if isProd()')
  }
}

// const retry = {
//   backoffBase: 500,
//   backoffExponent: 1.1,
//   match: [/SequelizeConnectionError/],
//   max: 10,
//   name: 'connection',
//   timeout: 60000
// }

const dbConfig = {
  database: process.env.POSTGRES_DB,
  define: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  dialect: 'postgres',
  dialectOptions: {
    ssl: isProd()
  },
  hooks,
  host: process.env.POSTGRES_HOST,
  password: 'ppp',
  port: process.env.POSTGRES_PORT,
  logging: function (str) {
    console.log('inside of sequalize logging function')
    console.log(str)
  },
  schema: process.env.POSTGRES_SCHEMA_NAME,
  username: process.env.POSTGRES_USERNAME
}

module.exports = {
  development: dbConfig,
  production: dbConfig,
  test: dbConfig
}
