require('../app-insights').setup()
const Hapi = require('@hapi/hapi')

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
