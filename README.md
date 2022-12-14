# FFC AHWR Eligibility

> Eligibility checking microservice for Animal Health and Welfare Review

## Prerequisites

- Docker
- Docker Compose

Optional:

- Kubernetes
- Helm

## Folder Structure

The folder structure follows an approach of seperating functionality into use cases and keeping this 
seperate from generic boilerplate code.

`app/register-your-interest` contains all the functionality for the register your interest journey.
`app/auto-elgibility` contains all the business logic for checking a farmers elgibility to gain access to Vet Vists.

## Message Queue Examples

See `docs/asyncapi.yaml` for more information.

### Queue Name
ffc-ahwr-register-your-interest-request   

### Message Body


```
{
  "sbi": "123456789",
  "crn": "1234567890",
  "email": 'email@email.com'
}
```




### Environment variables

The following environment variables are required by the application.
Values for development are set in the Docker Compose configuration. Default
values for production-like deployments are set in the Helm chart and may be
overridden by build and release pipelines.

Please ask a developer for an example `.env` file that you can include in the root of your project that will contain environment variables overrirdes for local development that are different than the docker-compose file.

| Name                                  | Description                                                                                      |
| ----                                  | -----------                                                                                      |
| LIQUIBASE_CONTEXTS      | Expressions that control whether commands like update run certain changesets |
| WAITING_LIST_SCHEDULE      | Cron expression for frequency of waiting list job                 |
| WAITING_LIST_SCHEDULER_ENABLED      | Feature switch to control running of waiting list cron job        |
| WAITING_LIST_THRESHOLD_UPPER_LIMIT      | Upper limit for how many farmers from the waiting list can be provided access to the service in one cron job process      |
| WAITING_LIST_TEMPLATE_ID_      | Notify template ID for the waiting list email
| INELIGIBLE_GENERIC_TEMPLATE_ID      | Notify template ID for the generic exception email        |
| APPLY_INVITE_TEMPLATE_ID      | Notify template ID for the apply guidance invite       |


## Running the application

The application is designed to run in containerised environments, using Docker
Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to
run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the
CSS files that were generated during the Docker build. For the site to render
correctly locally `npm run build` must be run on the host system.

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```sh
# Build container images
docker-compose build
```

### Start

For local development run the start script to execute the
Liquibase database migrations (creating tables, columns, seed data etc) and start the application

```sh
./scripts/start
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```sh
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT
LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and
applications when using this information.

> Contains public sector information licensed under the Open Government license
> v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her
Majesty's Stationery Office (HMSO) to enable information providers in the
public sector to license the use and re-use of their information under a common
open licence.

It is designed to encourage use and re-use of information freely and flexibly,
with only a few conditions.
