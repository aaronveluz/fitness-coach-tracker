// ─────────────────────────────────────────────────────────────────────────────
// backend/src/config/swagger.ts
//
// Swagger / OpenAPI documentation config.
// API docs are available at http://localhost:4000/api/docs in development.
// ─────────────────────────────────────────────────────────────────────────────

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${env.APP_NAME} API`,
      version: '1.0.0',
      description: `
## Enterprise Boilerplate API

Auto-generated API documentation. All endpoints require a **Bearer JWT token**
unless marked as public (login, register, health check).

### Authentication
1. POST \`/api/auth/login\` → receive \`accessToken\`
2. Add header: \`Authorization: Bearer <accessToken>\`
3. When access token expires, POST \`/api/auth/refresh\` with the refresh cookie.
      `,
    },
    servers: [{ url: `http://localhost:${env.APP_PORT}/api`, description: 'Local Development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan all route files for JSDoc @swagger annotations
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
