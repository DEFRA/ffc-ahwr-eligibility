require('../insights').setup()
const Hapi = require('@hapi/hapi')

const server = Hapi.server({
  port: process.env.PORT
})

const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../register-your-interest/routes/eligibility')
)

server.route(routes)

module.exports = server
