const Hapi = require('@hapi/hapi')
const setup = require('../app-insights/setup')

setup()

const server = Hapi.server({
  port: process.env.PORT
})

const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../auto-eligibility/routes/eligibility'),
  require('../auto-eligibility/routes/businesses')
)

server.route(routes)

module.exports = server
