const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Secrets
const ACCESS_SECRET = 'access_secret_key';
const REFRESH_SECRET = 'refresh_secret_key';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Mock Data
let users = [];
let products = [];
let refreshTokens = new Set();

// Helpers
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Middlewares
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  console.log(scheme+' '+token);
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Control Work API',
      version: '1.0.0',
      description: 'Unified API for Control Work 1 & 2',
    },
    servers: [
      {
        url: `http://localhost:5000`,
        description: 'Local server',
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
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  console.log(req.body);
  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (users.some(u => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('hashed password: ' + hashedPassword);
  const newUser = {
    id: nanoid(),
    email,
    first_name,
    last_name,
    password: hashedPassword,
    role: role || 'user',
  };

  users.push(newUser);
  console.log(users);
  res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email + password);
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    
    if (!user) return res.status(401).json({ error: 'User not found' });

    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

// --- User Management (Admin only) ---

app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const { first_name, last_name, role } = req.body;
  users[index] = {
    ...users[index],
    first_name: first_name || users[index].first_name,
    last_name: last_name || users[index].last_name,
    role: role || users[index].role,
  };

  const { password, ...updatedUser } = users[index];
  res.json(updatedUser);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(index, 1);
  res.status(204).send();
});

// --- Products Routes ---

app.get('/api/products', (req, res) => {
  // todo: check user auth
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id || p.id == req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price, stock, rating, image } = req.body;
  if (!title || !category || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newProduct = {
    id: nanoid(),
    title,
    category,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    rating: Number(rating) || 0,
    image: image || '/img/asus_laptop.jpeg'
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id || p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const { title, category, description, price, stock, rating, image } = req.body;
  products[index] = {
    ...products[index],
    title: title || products[index].title,
    category: category || products[index].category,
    description: description || products[index].description,
    price: price !== undefined ? Number(price) : products[index].price,
    stock: stock !== undefined ? Number(stock) : products[index].stock,
    rating: rating !== undefined ? Number(rating) : products[index].rating,
    image: image || products[index].image,
  };

  res.json(products[index]);
});

app.patch('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id || p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const updates = req.body;
  products[index] = { ...products[index], ...updates };
  
  res.json(products[index]);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id || p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  products.splice(index, 1);
  res.status(204).send();
});

// --- Default Data Seed ---
(async () => {
  const saltRounds = 10;
  
  users.push({
    id: 'admin_id',
    email: 'admin@test.com',
    first_name: 'Admin',
    last_name: 'User',
    password: await bcrypt.hash('admin123', saltRounds),
    role: 'admin',
  });

  users.push({
    id: 'seller_id',
    email: 'seller@test.com',
    first_name: 'Seller',
    last_name: 'One',
    password: await bcrypt.hash('seller123', saltRounds),
    role: 'seller',
  });

  users.push({
    id: 'user_id',
    email: 'user@test.com',
    first_name: 'John',
    last_name: 'Doe',
    password: await bcrypt.hash('user123', saltRounds),
    role: 'user',
  });

  // Seed from KR1
  products.push(
    { id: 1, title: 'ASUS ROG Laptop', category: 'Laptops', price: 75000, stock: 15, rating: 4.5, image: '/img/asus_laptop.jpeg', description: 'Gaming laptop' },
    { id: 2, title: 'MacBook Pro 16', category: 'Laptops', price: 150000, stock: 8, rating: 4.9, image: '/img/macbook_pro.jpeg', description: 'Apple Pro laptop' },
    { id: 3, title: 'iPhone 15 Pro', category: 'Smartphones', price: 90000, stock: 25, rating: 4.8, image: '/img/iphone_15.jpeg', description: 'Apple flagship' },
    { id: 4, title: 'Samsung S24 Ultra', category: 'Smartphones', price: 85000, stock: 20, rating: 4.7, image: '/img/samsung_galaxy_s24.jpeg', description: 'Samsung flagship' },
    { id: 5, title: 'Sony WH-1000XM5', category: 'Headphones', price: 35000, stock: 30, rating: 4.8, image: '/img/sony_wh-1000xm5.jpeg', description: 'Noise cancelling headphones' }
  );
})();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});
;
