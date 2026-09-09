import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'API REST VELYSH',
      version: '1.0.0',
      description: 'Documentación de la API REST del proyecto VELYSH',
    },

    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec