import { SwaggerConfig } from '@ioc:Adonis/Addons/Swagger'

export default {
  uiEnabled: true,
  uiUrl: 'docs',
  specEnabled: true,
  specUrl: '/swagger.json',

  middleware: [],

  options: {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Seal Backend API',
        version: '1.0.0',
        description: 'API documentation untuk Seal Backend'
      },
      servers: [
        {
          url: 'https://seal.gilanghuda.my.id',
          description: 'Production server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },

    apis: [
      'build/app/**/*.js',
      'build/start/**/*.js',
    ],
  },
  mode: 'RUNTIME',
} as SwaggerConfig
