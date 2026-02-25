const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/User', () => {
  const mockUser = {
    _id: 'userId123',
    username: 'testuser',
    email: 'test@example.com',
    matchPassword: jest.fn().mockResolvedValue(true)
  };
  
  return {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    })
  };
});

jest.mock('../src/models/GroceryList');
jest.mock('../src/config/db', () => jest.fn().mockResolvedValue(true));

process.env.JWT_SECRET = 'test_secret';

const app = require('../src/server');
const User = require('../src/models/User');
const GroceryList = require('../src/models/GroceryList');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const mockUser = {
        _id: 'userId123',
        username: 'testuser',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe('testuser');
    });

    it('debería fallar si el usuario ya existe', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Usuario o email ya registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión correctamente', async () => {
      const mockUser = {
        _id: 'userId123',
        username: 'testuser',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('debería fallar con credenciales incorrectas', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email o contraseña incorrectos');
    });
  });
});

describe('Grocery List Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    _id: 'userId123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  beforeEach(() => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
  });

  describe('GET /api/grocery-lists', () => {
    it('debería obtener todas las listas de compras', async () => {
      const mockLists = [
        { _id: 'list1', name: 'Lista 1', items: [] },
        { _id: 'list2', name: 'Lista 2', items: [] }
      ];

      GroceryList.find.mockResolvedValue(mockLists);

      const res = await request(app)
        .get('/api/grocery-lists')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debería fallar sin token', async () => {
      const res = await request(app)
        .get('/api/grocery-lists');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/grocery-lists', () => {
    it('debería crear una nueva lista de compras', async () => {
      const mockList = {
        _id: 'listId123',
        name: 'Nueva Lista',
        items: [],
        user: 'userId123'
      };

      GroceryList.create.mockResolvedValue(mockList);

      const res = await request(app)
        .post('/api/grocery-lists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nueva Lista',
          items: []
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Nueva Lista');
    });
  });

  describe('DELETE /api/grocery-lists/:id', () => {
    it('debería eliminar una lista de compras', async () => {
      const mockList = {
        _id: 'listId123',
        name: 'Lista a eliminar',
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      GroceryList.findOne.mockResolvedValueOnce(mockList);

      const res = await request(app)
        .delete('/api/grocery-lists/listId123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Lista eliminada');
    });

    it('debería fallar si la lista no existe', async () => {
      GroceryList.findOne.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/grocery-lists/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});

describe('JWT Middleware', () => {
  it('debería generar un token JWT válido', () => {
    const { generateToken } = require('../src/middlewares/authMiddleware');
    const token = generateToken('userId123');
    
    expect(token).toBeDefined();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('userId123');
  });

  it('debería verificar un token inválido', () => {
    const { generateToken } = require('../src/middlewares/authMiddleware');
    
    expect(() => {
      jwt.verify('invalid_token', process.env.JWT_SECRET);
    }).toThrow();
  });
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
