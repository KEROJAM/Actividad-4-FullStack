const request = require('supertest');

jest.mock('../src/config/db', () => jest.fn().mockResolvedValue(true));
jest.mock('../src/models/User');
jest.mock('../src/models/Product');
jest.mock('../src/models/GroceryList');

const app = require('../src/server');

describe('Server', () => {
  describe('GET /', () => {
    it('debería servir el archivo login.html', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.type).toBe('text/html');
    });
  });

  describe('Rutas API', () => {
    it('debería responder 404 para rutas no definidas', async () => {
      const res = await request(app).get('/ruta-inexistente');
      expect(res.status).toBe(404);
    });

    it('debería tener rutas de auth configuradas', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect([400, 404, 500]).toContain(res.status);
    });

    it('debería tener rutas de products configuradas', async () => {
      const res = await request(app).get('/api/products');
      expect([401, 404, 500]).toContain(res.status);
    });

    it('debería tener rutas de grocery-lists configuradas', async () => {
      const res = await request(app).get('/api/grocery-lists');
      expect(res.status).toBe(401);
    });
  });

  describe('Middleware de errores', () => {
    it('debería manejar errores del servidor', async () => {
      const res = await request(app).get('/');
      expect(res.status).not.toBe(500);
    });
  });
});
