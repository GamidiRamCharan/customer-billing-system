const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shop Management API',
      version: '1.0.0',
      description: 'API documentation for the shop management system (items, customers, bills, auth).',
    },
    servers: [{ url: 'http://localhost:5000/api' }],
  },
  // Paths to files containing JSDoc comments for routes
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(options);
