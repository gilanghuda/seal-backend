import Route from '@ioc:Adonis/Core/Route'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs/promises'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import './routes/AuthRoutes'
import './routes/ChatRoutes'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/swagger.json', async ({ response }) => {
  const candidates = [
    Application.makePath('docs', 'swagger.json'),
    Application.makePath('public', 'docs', 'swagger.json'),
  ]

  for (const swaggerPath of candidates) {
    try {
      const raw = await fs.readFile(swaggerPath, 'utf-8')
      return response.header('Content-Type', 'application/json').send(raw)
    } catch (err) {

    }
  }

  response.status(404).send({ error: 'swagger.json not found in docs/ or public/docs/' })
})

Route.get('/docs', async ({ response }) => {
  const specUrl = '/swagger.json'
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
    <style>body { margin:0; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        deepLinking: true
      })
    </script>
  </body>
</html>`
  response.header('Content-Type', 'text/html').send(html)
})