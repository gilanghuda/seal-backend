import { SwaggerConfig } from '@ioc:Adonis/Addons/Swagger'

export default {
	uiEnabled: true, //disable or enable swaggerUi route
	uiUrl: '/docs', 
	specEnabled: true, //disable or enable swagger.json route
	specUrl: '/docs/swagger.json', 

	middleware: [], // middlewares array, for protect your swagger docs and spec endpoints

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
					description: 'Development server',
				},
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
						description: 'JWT token for authentication',
					},
				},
			},
			tags: [
				{
					name: 'Auth',
					description: 'Authentication endpoints',
				},
			],
		},

		apis: [
			'app/**/*.ts',
			'docs/swagger/**/*.yml',
			'start/routes.ts',
			'start/routes/**/*.ts'
		],
		basePath: '/'
	},
	mode: 'PRODUCTION',
  specFilePath: 'docs/swagger.json'
} as SwaggerConfig
